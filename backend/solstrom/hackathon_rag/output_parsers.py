from typing_extensions import Literal, Annotated, TypedDict,cast, Any

class ExtractParams(TypedDict, total=False):
    query: Annotated[str, 'Original user query to search in vector search']
    country: Annotated[str, 'Country name in hackathon']
    tracks: Annotated[list[Literal['Consumer', 'Infrastructure', 'DAOs & Network States', 'DePin', 'DeFi', 'Stablecoins', 'AI', 'Payments', 'Undefined', 'DePIN', 'RWAs', 'DAOs & Communities', 'Consumer Apps', 'Gaming', 'DeFi & Payments']],'Tracks in hackathon']
    prize_name: Annotated[Literal['Honorable Mentions', 'Track Winners', 'Awards', 'Grand Prize'], 'Name of the prize won in hackathon']
    hackathon_name: Annotated[Literal['Frontier', 'Breakout', 'Cypherpunk', 'Radar', 'Renaissance'],"Name of the hackathon"]
