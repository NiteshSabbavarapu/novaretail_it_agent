import logging
from operator import itemgetter
from core.models import DocumentChunk, DocumentParentChunk
from core.embedding_utils import generate_embeddings
from core.pinecone_utils import index
from rank_bm25 import BM25Okapi
from sentence_transformers import CrossEncoder

logger = logging.getLogger(__name__)

reranker = CrossEncoder(
    "cross-encoder/ms-marco-MiniLM-L-6-v2"
)


def delete_document_vectors(document_id, chunk_ids=None):
    """Safely deletes vectors from Pinecone by chunk IDs or metadata filter."""
    if not document_id and not chunk_ids:
        return False

    success = True
    # 1. Delete by chunk IDs if known
    if chunk_ids:
        id_strings = [str(cid) for cid in chunk_ids]
        # Batch deletes in groups of 100
        for i in range(0, len(id_strings), 100):
            batch = id_strings[i : i + 100]
            try:
                index.delete(ids=batch)
            except Exception as exc:
                logger.warning(f"Error deleting vector batch by IDs: {exc}")
                success = False

    # 2. Attempt filter-based deletion
    if document_id:
        try:
            index.delete(filter={"document_id": {"$eq": int(document_id)}})
        except Exception:
            # Serverless or index pod type might not support filter delete
            pass

    return success


def index_document_chunks(document_id, batch_size=100):
    """Generates 384-dim embeddings for child chunks and upserts them to Pinecone."""
    chunks = (
        DocumentChunk.objects.filter(document_id=document_id)
        .select_related("document", "parent")
        .order_by("chunk_index")
    )

    if not chunks.exists():
        return 0

    texts = [chunk.content for chunk in chunks]
    embeddings = generate_embeddings(texts)

    vectors = []
    for chunk, embedding in zip(chunks, embeddings):
        vectors.append({
            "id": str(chunk.id),
            "values": embedding,
            "metadata": {
                "document_id": chunk.document_id,
                "chunk_id": chunk.id,
                "parent_id": chunk.parent_id_str or "",
                "section_id": chunk.section_id or "",
                "section_title": chunk.section_title or "",
                "content_type": chunk.content_type or "text",
                "department_id": chunk.document.department_id,
                "page_number": chunk.page_number,
                "chunk_index": chunk.chunk_index,
            },
        })

    total_indexed = 0
    for i in range(0, len(vectors), batch_size):
        batch = vectors[i : i + batch_size]
        index.upsert(vectors=batch)
        total_indexed += len(batch)

    return total_indexed


def semantic_search(query, department_id=None, top_k=10):
    """Executes dense vector search against Pinecone."""
    query_embedding = generate_embeddings([query])[0]

    filter_dict = {"department_id": {"$eq": department_id}} if department_id else None

    search_results = index.query(
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True,
        filter=filter_dict,
    )

    results = []
    for match in search_results.get("matches", []):
        results.append({
            "chunk_id": match["metadata"]["chunk_id"],
            "document_id": match["metadata"]["document_id"],
            "page_number": match["metadata"]["page_number"],
            "score": match["score"],
        })

    return results


def bm25_search(query, department_id, top_k=10):
    """Executes sparse BM25 keyword search across document chunks."""
    if department_id is None:
        raise ValueError("Department ID is required")

    chunks = list(
        DocumentChunk.objects.filter(document__department_id=department_id).select_related(
            "document", "parent"
        )
    )

    if not chunks:
        return []

    tokenized_corpus = [chunk.content.lower().split() for chunk in chunks]
    bm25 = BM25Okapi(tokenized_corpus)

    tokenized_query = query.lower().split()
    scores = bm25.get_scores(tokenized_query)

    ranked_results = sorted(zip(chunks, scores), key=lambda item: item[1], reverse=True)

    results = []
    for chunk, score in ranked_results[:top_k]:
        if score <= 0:
            continue
        results.append({
            "chunk_id": chunk.id,
            "document_id": chunk.document_id,
            "page_number": chunk.page_number,
            "content": chunk.content,
            "score": float(score),
        })

    return results


def reciprocal_rank_fusion(semantic_results, bm25_results, k=60, top_k=20):
    """Combines semantic and BM25 rankings via Reciprocal Rank Fusion."""
    fused_results = {}
    search_lists = [semantic_results, bm25_results]

    for search_results in search_lists:
        for rank, result in enumerate(search_results, start=1):
            chunk_id = result["chunk_id"]

            if chunk_id not in fused_results:
                fused_results[chunk_id] = {
                    key: value for key, value in result.items() if key != "score"
                }
                fused_results[chunk_id]["rrf_score"] = 0
            else:
                if "content" in result:
                    fused_results[chunk_id]["content"] = result["content"]

            fused_results[chunk_id]["rrf_score"] += 1 / (k + rank)

    ranked_results = sorted(
        fused_results.values(),
        key=itemgetter("rrf_score"),
        reverse=True,
    )

    return ranked_results[:top_k]


def retrieve_chunks(search_results, department_id):
    """Retrieves full chunk records and attached parent references from PostgreSQL."""
    if department_id is None:
        raise ValueError("Department ID is required")

    chunk_ids = [result["chunk_id"] for result in search_results]

    chunks = (
        DocumentChunk.objects.filter(
            id__in=chunk_ids,
            document__department_id=department_id,
        )
        .select_related("document", "parent")
        .in_bulk()
    )

    results = []
    for result in search_results:
        chunk = chunks.get(result["chunk_id"])
        if chunk is None:
            continue

        retrieved = {
            "chunk_id": chunk.id,
            "document_id": chunk.document_id,
            "page_number": chunk.page_number,
            "chunk_index": chunk.chunk_index,
            "content": chunk.content,
            "parent_id_str": chunk.parent_id_str,
            "section_id": chunk.section_id,
            "section_title": chunk.section_title,
            "content_type": chunk.content_type,
            "parent": chunk.parent,
        }

        if "score" in result:
            retrieved["score"] = result["score"]
        if "rrf_score" in result:
            retrieved["rrf_score"] = result["rrf_score"]

        results.append(retrieved)

    return results


def rerank_results(query, search_results, top_k=10):
    """Cross-encoder reranking of candidate chunks against the query."""
    if not search_results:
        return []

    pairs = [[query, result["content"]] for result in search_results]
    scores = reranker.predict(pairs)

    for result, score in zip(search_results, scores):
        result["rerank_score"] = float(score)

    reranked_results = sorted(
        search_results,
        key=lambda res: res["rerank_score"],
        reverse=True,
    )

    return reranked_results[:top_k]


def expand_and_deduplicate_parents(reranked_child_chunks, top_k=5):
    """Expands reranked child chunks into deduplicated parent contexts.

    Preserves:
    - Complete parent content (for full LLM comprehension)
    - Matched child snippets (for targeted relevance)
    - Best cross-encoder score
    - Source page references and section titles
    """
    if not reranked_child_chunks:
        return []

    seen_parents = {}
    ordered_parent_keys = []

    for child in reranked_child_chunks:
        parent = child.get("parent")
        if parent is not None:
            parent_key = f"p_{parent.id}"
            parent_content = parent.content
            parent_doc_id = parent.document_id
            parent_page_start = parent.page_start
            parent_page_end = parent.page_end
            section_title = parent.section_title or child.get("section_title", "")
            content_type = parent.content_type
            p_id = parent.parent_id
        else:
            # Fallback for legacy chunks without parent
            parent_key = f"c_{child['chunk_id']}"
            parent_content = child["content"]
            parent_doc_id = child["document_id"]
            parent_page_start = child["page_number"]
            parent_page_end = child["page_number"]
            section_title = child.get("section_title", "")
            content_type = child.get("content_type", "text")
            p_id = child.get("parent_id_str", "")

        child_score = child.get("rerank_score", 0.0)
        child_page = child.get("page_number", parent_page_start)
        child_snippet = child["content"][:200] + ("..." if len(child["content"]) > 200 else "")

        if parent_key not in seen_parents:
            seen_parents[parent_key] = {
                "document_id": parent_doc_id,
                "page_number": child_page,
                "page_start": parent_page_start,
                "page_end": parent_page_end,
                "content": parent_content,
                "rerank_score": child_score,
                "parent_id": p_id,
                "section_title": section_title,
                "content_type": content_type,
                "matched_child_snippets": [child_snippet],
                "source_pages": {child_page},
            }
            ordered_parent_keys.append(parent_key)
        else:
            # Merge child snippets and update best score if higher
            existing = seen_parents[parent_key]
            if child_score > existing["rerank_score"]:
                existing["rerank_score"] = child_score
            existing["source_pages"].add(child_page)
            if child_snippet not in existing["matched_child_snippets"]:
                existing["matched_child_snippets"].append(child_snippet)

    # Convert source_pages set to sorted list for JSON serialization
    results = []
    for key in ordered_parent_keys[:top_k]:
        item = seen_parents[key]
        item["source_pages"] = sorted(list(item["source_pages"]))
        results.append(item)

    return results


def hybrid_search(query, department_id, top_k=5):
    """Full Document-Aware Child-to-Parent Retrieval Pipeline.

    Flow:
    1. Pinecone Semantic search (top 15)
    2. BM25 keyword search (top 15)
    3. Reciprocal Rank Fusion (top 25)
    4. Child retrieval from PostgreSQL
    5. Cross-Encoder reranking of children (top 15)
    6. Parent expansion & deduplication (top 5)
    """
    semantic_results = semantic_search(
        query,
        department_id=department_id,
        top_k=15,
    )

    bm25_results = bm25_search(
        query,
        department_id=department_id,
        top_k=15,
    )

    fused_results = reciprocal_rank_fusion(
        semantic_results,
        bm25_results,
        top_k=25,
    )

    retrieved_chunks = retrieve_chunks(
        fused_results,
        department_id=department_id,
    )

    reranked_child_chunks = rerank_results(
        query,
        retrieved_chunks,
        top_k=15,
    )

    final_parent_contexts = expand_and_deduplicate_parents(
        reranked_child_chunks,
        top_k=top_k,
    )

    return final_parent_contexts
