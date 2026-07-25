## To do RAG on json

- Find the fields which are searcable like description, title
- Find the fields which are like categories, ratings (1 to 5), level (easy, advanced) etc keep them into metadata for metadata filtering

we need to use this document, to seperate and define in metadata
```
langchain_core.documents import Document
```

## Next Steps

- create a custom tool whole current prompt evrrything act as idea tool
- create a another tool of hackathon winner

based on user query, llm can access these tools and pass relavent content & give relavent output
----------------------------------------

AI reference

For **your specific JSON structure**, I would prefer creating `Document` objects manually over `JSONLoader`.

Why?

`JSONLoader` is mainly for:

* Reading JSON files
* Extracting data using `jq_schema`
* Converting extracted records into `Document` objects automatically

Example:

```python id="g4d4f6"
loader = JSONLoader(...)
docs = loader.load()
```

But your use case needs custom mapping:

```python id="g1v9lp"
Document(
    page_content=...,
    metadata=...
)
```

because you want:

```text id="qf9o9n"
title + problem + solution → embeddings

author_names
difficulty_score
published
categories
→ metadata
```

`JSONLoader` won't automatically know which fields should become metadata vs embedded content. You would still need post-processing.

So:

* **Simple JSON ingestion** → `JSONLoader`
* **Production RAG with custom metadata/filtering** → Manual `Document` creation

For your dataset, **manual `Document` creation is cleaner and gives full control**, so it's the better choice.
