# csuite_analysis/questions.py

IC_Questions = [
    "What is the name of the company under consideration? Who is the CEO of the company? Have they successfully held CEO positions before? Did any of their previous companies go on to a successful exit (sale, IPO)? Did any go into administration or liquidation? Include full source snippets and citations (URLs if web-based). Explain your reasoning clearly.",
    "Is the current management team fully formed and equipped to deliver on the company’s stated strategy? Assess based on their skills, sector experience, and structure. Support your conclusion with references and quotes from source material.",
    "How long has the CEO been in their current role? Is this duration consistent with building and delivering a long-term strategy? Provide source evidence and commentary.",
    "What is the level of ambition demonstrated by the CEO and the broader leadership team? Consider public statements, hiring plans, fundraising goals, and strategic milestones. Quote sources and provide a reasoned evaluation.",
    "What is the depth of the executive team? Is there evidence of succession planning or over-reliance on one or two individuals? Provide detailed analysis with references to source material (the deck and/or web sources).",
    "What is the website URL of the company? (Verify from a reliable source.)"
]

response_guidelines = (
    "Use only the tool selected for this task. Do not mix tools or reference results from other sources.",
    "Respond in well-structured British English, using paragraphs with clear formatting.",
    "Follow the tone and clarity of the Financial Times — factual, objective, and concise.",
    "When using the RAG tool, base the answer strictly on retrieved chunks from the internal document (the Deck).",
    "When using the web_search_tool, include URLs for every cited source and clearly identify the origin of each snippet.",
    "Use each tool a maximum of three times if needed, even if early attempts are inconclusive.",
    "If the analyst appraisal tool is used, conclude with a professional evaluation and assign a final score (1–5), followed by a self-reflection on confidence."
)
