import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    client = AsyncIOMotorClient("mongodb://localhost:27017")

    result = await client.admin.command("ping")

    print(result)
    print("MongoDB CONNECTED")

    client.close()

asyncio.run(main())