import { Container, VStack, Text, SimpleGrid } from '@chakra-ui/react'
import React from 'react'
import { usePlayerStore } from "../store/player";
import { useEffect } from "react";
import { Link } from 'react-router-dom'

const HomePage = () => {
  const {fetchPlayers,players } = usePlayerStore();
  useEffect(() => {
    fetchPlayers();

  }, [fetchPlayers]);
  console.log("players",players)


  return (
    <Container maxW='container.xl' py={12}>
      <VStack spacing={8}>
        <Text
					fontSize={"30"}
					fontWeight={"bold"}
					bgGradient={"linear(to-r, cyan.400, blue.500)"}
					bgClip={"text"}
					textAlign={"center"}
				>
          Current Players
        </Text>


        <SimpleGrid
					columns={{
						base: 1,
						md: 2,
						lg: 3,
					}}
					spacing={10}
					w={"full"}
				>
					{players.map((player) => (
						<PlayerCard key={player._id} player={player} />
					))}
				</SimpleGrid>



        
        {players.length === 0 && (
					<Text fontSize='xl' textAlign={"center"} fontWeight='bold' color='gray.500'>
						No player found 😢{" "}
						<Link to={"/create"}>
							<Text as='span' color='blue.500' _hover={{ textDecoration: "underline" }}>
								Create a player
							</Text>
						</Link>
        </Text>
        )}
      </VStack>
    </Container>
  )
}

export default HomePage