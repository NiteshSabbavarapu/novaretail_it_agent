from core.models import DocumentChunk
from core.embedding_utils import generate_embeddings
from core.pinecone_utils import index
from rank_bm25 import BM25Okapi
from operator import itemgetter
from sentence_transformers import CrossEncoder

reranker = CrossEncoder(
    "cross-encoder/ms-marco-MiniLM-L-6-v2"
)

#
# 1. Semantic search
# Pinecone finds chunks that are conceptually related to password resetting.
# 2. BM25
# Finds chunks containing matching keywords such as password, reset, and company.
# 3. RRF
# Combines both retrieval rankings and produces a unified candidate list.
# 4. Cross-encoder reranking
# Evaluates each candidate against the actual question and reorders them based on relevance.
# 5. Final output
# We return the top 5 chunks.


def index_document_chunks(document_id):
    chunks = DocumentChunk.objects.filter(
        document_id=document_id
    ).order_by("chunk_index")

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
                "department_id": chunk.document.department_id,
                "page_number": chunk.page_number,
                "chunk_index": chunk.chunk_index,
            }
        })

    index.upsert(vectors=vectors)

    return len(vectors)


def semantic_search(query, department_id=None, top_k=5):
    query_embedding = generate_embeddings([query])[0]

    search_results = index.query(
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True,
        filter={
            "department_id": {"$eq": department_id}
        } if department_id else None
    )

    results = []

    for match in search_results["matches"]:
        results.append({
            "chunk_id": match["metadata"]["chunk_id"],
            "document_id": match["metadata"]["document_id"],
            "page_number": match["metadata"]["page_number"],
            "score": match["score"],
        })

    return results


def retrieve_chunks(search_results, department_id):
    if department_id is None:
        raise ValueError("Department ID is required")

    chunk_ids = [result["chunk_id"] for result in search_results]

    chunks = DocumentChunk.objects.filter(
        id__in=chunk_ids,
        document__department_id=department_id
    ).in_bulk()

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
            "content": chunk.content
        }

        if "score" in result:
            retrieved["score"] = result["score"]

        if "rrf_score" in result:
            retrieved["rrf_score"] = result["rrf_score"]

        results.append(retrieved)

    return results


def bm25_search(query, department_id, top_k=5):
    if department_id is None:
        raise ValueError("Department ID is required")

    chunks = list(
        DocumentChunk.objects.filter(
            document__department_id=department_id
        )
    )

    if not chunks:
        return []

    tokenized_corpus = [
        chunk.content.lower().split()
        for chunk in chunks
    ]

    bm25 = BM25Okapi(tokenized_corpus)

    tokenized_query = query.lower().split()

    scores = bm25.get_scores(tokenized_query)

    ranked_results = sorted(
        zip(chunks, scores),
        key=lambda item: item[1],
        reverse=True
    )

    results = []

    for chunk, score in ranked_results[:top_k]:
        if score <= 0:
            continue

        results.append({
            "chunk_id": chunk.id,
            "document_id": chunk.document_id,
            "page_number": chunk.page_number,
            "content": chunk.content,
            "score": float(score)
        })

    return results


# sigma(1/k+rank) -> ranking based on this (k = 60) because if we use other than 60 the starting rank will get more advantage in calculations.
def reciprocal_rank_fusion(semantic_results, bm25_results, k=60, top_k=10):
    fused_results = {}

    search_lists = [
        semantic_results,
        bm25_results
    ]

    for search_results in search_lists:

        for rank, result in enumerate(search_results, start=1):

            chunk_id = result["chunk_id"]

            if chunk_id not in fused_results:
                fused_results[chunk_id] = {
                    key: value
                    for key, value in result.items()
                    if key != "score"
                }
                fused_results[chunk_id]["rrf_score"] = 0

            else:
                if "content" in result:
                    fused_results[chunk_id]["content"] = result["content"]

            fused_results[chunk_id]["rrf_score"] += 1 / (k + rank)

    ranked_results = sorted(
        fused_results.values(),
        key=itemgetter("rrf_score"),
        reverse=True
    )

    return ranked_results[:top_k]


# re-rank the results after the reciprocal rank fusion here.
def rerank_results(query, search_results, top_k=5):
    if not search_results:
        return []

    pairs = []

    for result in search_results:
        pairs.append([
            query,
            result["content"]
        ])

    scores = reranker.predict(pairs)

    for result, score in zip(search_results, scores):
        result["rerank_score"] = float(score)

    reranked_results = sorted(
        search_results,
        key=lambda result: result["rerank_score"],
        reverse=True
    )

    return reranked_results[:top_k]

def hybrid_search(query, department_id, top_k=5):

    semantic_results = semantic_search(
        query,
        department_id=department_id,
        top_k=10
    )

    bm25_results = bm25_search(
        query,
        department_id=department_id,
        top_k=10
    )

    fused_results = reciprocal_rank_fusion(
        semantic_results,
        bm25_results,
        top_k=20
    )

    retrieved_chunks = retrieve_chunks(
        fused_results,
        department_id=department_id
    )

    reranked_results = rerank_results(
        query,
        retrieved_chunks,
        top_k=top_k
    )

    return reranked_results