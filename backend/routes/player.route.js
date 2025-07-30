import express from "express";

import {createPlayer, deletePlayer, getPlayers, updatePlayer} from "../controllers/player.controller.js";

const router = express.Router();

router.get("/", getPlayers);

router.post("/", createPlayer );

router.put("/:id", updatePlayer);

router.delete("/:id", deletePlayer);

router.get("/", (req,res) => {
    res.send('API is working');
});

export default router;