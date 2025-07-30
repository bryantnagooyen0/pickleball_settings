import React from 'react'
import { useState } from "react";
import { Box, Button, Container, Heading, Input, useColorModeValue, useToast, VStack } from "@chakra-ui/react";
import { usePlayerStore } from '../store/player';

const CreatePage = () => {
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    paddle: "",
    image: "",
  });

  const toast = useToast()

  const {createPlayer}=usePlayerStore()

  const handleAddPlayer = async() => {
    const {success,message} = await createPlayer(newPlayer);
    if(!success){
      toast({
        title:"Error",
        description: message,
        status:"error",
        isClosable:true
      })
    } else {
      toast({
        title:"Success",
        description: message,
        status: "success",
        isClosable: true
      });
    }
    setNewPlayer({ name:"", paddle:"", image:""});
  };

  return (
		<Container maxW={"container.sm"}>
			<VStack spacing={8}>
				<Heading as={"h1"} size={"2xl"} textAlign={"center"} mb={8}>
					Create New Player
				</Heading>

				<Box w={"full"} bg={useColorModeValue("white", "gray.800")} p={6} rounded={"lg"} shadow={"md"}>
					<VStack spacing={4}>
						<Input
							placeholder='Player Name'
							name='name'
							value={newPlayer.name}
							onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
						/>
						<Input
							placeholder='Paddle'
							name='paddle'
							value={newPlayer.paddle}
							onChange={(e) => setNewPlayer({ ...newPlayer, paddle: e.target.value })}
						/>
						<Input
							placeholder='Image URL'
							name='image'
							value={newPlayer.image}
							onChange={(e) => setNewPlayer({ ...newPlayer, image: e.target.value })}
						/>

						<Button colorScheme='blue' onClick={handleAddPlayer} w='full'>
							Add Player
						</Button>
					</VStack>
				</Box>
			</VStack>
		</Container>
	);
};

export default CreatePage