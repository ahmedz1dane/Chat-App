import mongoose from "mongoose";
import { Chat } from "../models/chat.model.js";
import { Msg } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResposnse.js";

// Function to create a new chat or return existing messages
const createChat = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    // Validate sender and receiver IDs
    if (
      !mongoose.Types.ObjectId.isValid(senderId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return res.status(400).json({ message: "Invalid user IDs" });
    }

    // Check if any messages exist with a chat containing the same admin as one of the users
    const existingChat = await Chat.findOne({
      isGroupChat: false,
      // participants: { $size: 2 },
      "participants.0": senderId,
      "participants.1": receiverId,
    });

    if (existingChat) {
      const messages = await Msg.aggregate([
        { $match: { chat: existingChat._id } },
        {
          $lookup: {
            from: "users",
            localField: "sender",
            foreignField: "_id",
            as: "senderDetails",
          },
        },
        { $unwind: "$senderDetails" },
        {
          $project: {
            content: 1,
            "senderDetails.name": 1,
            "senderDetails.email": 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } }, // Sort messages by creation date in descending order
      ]);

      if (messages.length > 0) {
        return res.status(200).json({ chat: existingChat, messages });
      } else {
        return res
          .status(201)
          .json(new ApiResponse(200, {}, "Chat already exists"));
      }
    } else {
      // Create a new chat if no existing messages are found
      const newChat = new Chat({
        name: "Private Chat",
        isGroupChat: false,
        participants: [senderId, receiverId],
        admin: senderId, // Assuming the sender is the admin of the chat
      });

      await newChat.save();

      return res.status(201).json({ chat: newChat, messages: [] });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const currentChats = async (req, res) => {
  try {
    const { currentUserId } = req.query; // Assuming 'req.user.id' contains the current user ID

    // Find chats where the current user is the admin
    const chats = await Chat.aggregate([
      { $match: { admin: new mongoose.Types.ObjectId(currentUserId) } },
      {
        $lookup: {
          from: "users",
          localField: "participants", // Lookup details for all participants in one go
          foreignField: "_id",
          as: "participantsDetails", // Keep the field name for clarity
        },
      },
      // {
      //   $unwind: "$participantsDetails",
      // },
      {
        $lookup: {
          from: "users",
          localField: "admin",
          foreignField: "_id",
          as: "adminUsername",
        },
      },
      {
        $unwind: "$adminUsername",
      },
      {
        $project: {
          _id: 1,
          name: 1,
          admin: 1,
          adminName: "$adminName.username",
          isGroupChat: 1,
          adminUsername: "$adminUsername.username",
          participantsDetails: {
            $cond: {
              if: { $gt: [{ $size: "$participantsDetails" }, 1] }, // Check if participantsDetails has more than 1 element
              then: {
                $filter: {
                  input: "$participantsDetails",
                  as: "participant",
                  cond: {
                    $ne: [
                      "$$participant._id",
                      new mongoose.Types.ObjectId(currentUserId),
                    ],
                  }, // Exclude admin using $ne
                },
              },
              else: "$participantsDetails", // Otherwise return the entire array
            },
          },
          // TODO: MAKE THIS POSSIBLE
          avatar: "$participantsDetails[0].avatar",
          createdAt: 1,
        },
      },
      {
        $sort: { createdAt: -1 }, // Sort by creation date in descending order
      },
    ]);

    return res.status(202).json({ chats });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export { createChat, currentChats };
