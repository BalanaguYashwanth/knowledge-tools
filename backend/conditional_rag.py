from langchain_core.prompts import ChatPromptTemplate
from pydantic import Field, BaseModel
from typing_extensions import Literal
from langchain_openrouter import ChatOpenRouter

from solstrom.main import process_user_query
from solstrom.hackathon_rag.hackathon_rag import rag_hackathon_winners


class ConditionOutput(BaseModel):
    condition_output: Literal["idea", "hackathon", "winner", "other"] = Field(
        description="The category that best matches the user's query"
    )


def decision_chain(user_query):

    prompt_template = ChatPromptTemplate.from_messages([
        (
            "system",
            """
You are a query classifier.

Classify the user's query into exactly one of these categories:

1. idea
   Use this when the user is asking for:
   - project ideas
   - NFT ideas
   - hackathon project ideas
   - suggestions for things to build
   - product or startup ideas

2. hackathon
   Use this when the user is asking about:
   - winners in hackathon
   - wants to know tracks of team details in hackathon

3. winner
   Use this when the user is asking:
   - who won
   - which project won
   - winner of a hackathon
   - winner of a specific track or category

4. other
   Use this when the query does not match any of the above categories.

Important:
- Return only the category that best matches the user's intent.
- Do not classify based only on individual keywords.
- Understand the overall meaning of the query.

Examples:

User: "Suggest some NFT ideas"
Category: idea

User: "Give me some projects I can build for a hackathon"
Category: idea

User: "What are some innovative DeFi project ideas?"
Category: idea

User: "Tell me about the Breakout Hackathon"
Category: hackathon

User: "What tracks were available in the Consumer DApps hackathon?"
Category: hackathon

User: "Who won the Breakout Hackathon?"
Category: winner

User: "Who won in the Consumer DApps track?"
Category: winner

User: "Which project was the winner of the NFT track?"
Category: winner

User: "What is the weather today?"
Category: other

User: "Explain how blockchain works"
Category: other
            """
        ),
        (
            "human",
            "{user_query}"
        )
    ])

    llm = ChatOpenRouter(
        model="openrouter/free",
        temperature=0
    )

    structured_llm = llm.with_structured_output(ConditionOutput)

    classifier_output = structured_llm.invoke(
        prompt_template.invoke({
            "user_query": user_query
        })
    )

    category = classifier_output.condition_output

    if category == "idea":
        return process_user_query(user_query)

    elif category in ["hackathon", "winner"]:
        return rag_hackathon_winners(user_query)

    else:
        return {
            "message": "No matching input"
        }