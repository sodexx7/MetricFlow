from datetime import datetime, timezone
from uuid import uuid4
from typing import Any, Dict, Optional
import json
import os
from dotenv import load_dotenv
from uagents import Context, Model, Protocol, Agent
from hyperon import MeTTa

from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    StartSessionContent,
    TextContent,
    chat_protocol_spec,
)

from metta.investment_rag import InvestmentRAG
from metta.OnChainFinance_knowledge import initialize_OnChainFinance_knowledge
from metta.protocols_knowledge import initialize_protocols_knowledge
from metta.utils import LLM, process_query

load_dotenv()
agent = Agent(name="On Chain Finance Advisor", port=8008, mailbox=True, publish_agent_details=True)

# todo ajust for on-chain finance
class InvestmentQuery(Model):
    query: str
    intent: str
    keyword: str

# REST API Models
class FinanceRequest(Model):
    query: str

class FinanceResponse(Model):
    query: str
    answer: str
    selected_question: Optional[str] = None
    error: Optional[str] = None

class HealthResponse(Model):
    status: str
    agent: str

def create_text_chat(text: str, end_session: bool = False) -> ChatMessage:
    content = [TextContent(type="text", text=text)]
    if end_session:
        content.append(EndSessionContent(type="end-session"))
    return ChatMessage(
        timestamp=datetime.now(timezone.utc),
        msg_id=uuid4(),
        content=content,
    )

metta = MeTTa()
initialize_OnChainFinance_knowledge(metta)
initialize_protocols_knowledge(metta)
rag = InvestmentRAG(metta)
llm = LLM(api_key=os.getenv("ASI_ONE_API_KEY"))

chat_proto = Protocol(spec=chat_protocol_spec)

@chat_proto.on_message(ChatMessage)
async def handle_message(ctx: Context, sender: str, msg: ChatMessage):
    ctx.storage.set(str(ctx.session), sender)
    await ctx.send(
        sender,
        ChatAcknowledgement(timestamp=datetime.now(timezone.utc), acknowledged_msg_id=msg.msg_id),
    )

    for item in msg.content:
        if isinstance(item, StartSessionContent):
            ctx.logger.info(f"Got a start session message from {sender}")
            continue
        elif isinstance(item, TextContent):
            user_query = item.text.strip()
            
            ctx.logger.info(f"Got On Chain Finance advice from {sender}: {user_query}")
            
            try:
                response = process_query(user_query, rag, llm)
                
                if isinstance(response, dict):
                    answer_text = f"**{response.get('selected_question', user_query)}**\n\n{response.get('humanized_answer', 'I apologize, but I could not process your query.')}"
                else:
                    answer_text = str(response)
                
                await ctx.send(sender, create_text_chat(answer_text))
                
            except Exception as e:
                ctx.logger.error(f"Error processing investment query: {e}")
                await ctx.send(
                    sender, 
                    create_text_chat("I apologize, but I encountered an error processing your investment query. Please try again.")
                )
        else:
            ctx.logger.info(f"Got unexpected content from {sender}")

@chat_proto.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    ctx.logger.info(f"Got an acknowledgement from {sender} for {msg.acknowledged_msg_id}")

# REST API endpoints
@agent.on_rest_post("/on-chain-finance", FinanceRequest, FinanceResponse)
async def finance_advice(ctx: Context, req: FinanceRequest) -> FinanceResponse:
    """REST endpoint for finance advice"""
    try:
        ctx.logger.info(f"REST API request received - Query: {req.query}")
        response = process_query(req.query, rag, llm)
        
        if isinstance(response, dict):
            ctx.logger.info(f"REST API response generated for query: {req.query}")
            return FinanceResponse(
                query=req.query,
                answer=response.get('humanized_answer', 'Could not process query'),
                selected_question=response.get('selected_question')
            )
        else:
            ctx.logger.info(f"REST API response generated for query: {req.query}")
            return FinanceResponse(
                query=req.query,
                answer=str(response)
            )
    except Exception as e:
        ctx.logger.error(f"REST API error for query '{req.query}': {e}")
        return FinanceResponse(
            query=req.query,
            answer="Error processing query",
            error=str(e)
        )

@agent.on_rest_get("/health", HealthResponse)
async def health_check(ctx: Context)  -> HealthResponse:
    """Health check endpoint"""
    ctx.logger.info("Health check endpoint called via REST API")
    return HealthResponse(status="healthy", agent="On Chain Finance Advisor")


agent.include(chat_proto, publish_manifest=True)

if __name__ == "__main__":
    agent.run()