import express from "express";
import fs from "fs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import authenticateUser from "../middlewares/authMiddleware.js";
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = path.join(__dirname, "..", "user_profiles.json");

router.get("/user", (req, res) => {
  console.log(`inside router`);
  res.send("inside router");
});

router.post("/signup", async (req, res) => {
  try {
    // Destructure required fields from the request body
    const { firstname, lastname, email, password } = req.body;
    // Validate required fields
    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({
        message: "Details can't be left empty",
      });
    }
    // Check if a user with the given email already exists
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(409).json({
        message: "For the given email, user already exists",
      });
    }
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create a new user document with the hashed password
    const user = new User({
      firstname,
      lastname,
      email,
      password: hashPassword,
    });

    // Save the user in the database
    await user.save();

    // Generate a JWT token using the user's ID
    const token = jwt.sign({ id: user._id }, process.env.SECRET);

    // Send success response with token
    return res.status(201).json({
      message: "User registered successfully !",
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

router.post("/signin", async (req, res) => {
  try {
    // Destructure required fields from the request body
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Details can't be left empty",
      });
    }

    // Check if user exists
    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res.status(400).json({
        message: "User doesn't exists, please check the credentials",
      });
    }

    // Compare entered password with stored hashed password
    const isPasswordMatched = await bcrypt.compare(
      password,
      userExist.password
    );
    if (!isPasswordMatched) {
      return res.status(401).json({
        message: "Invalid credentials for password",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: userExist._id,
        firstname: userExist.firstname,
        lastname: userExist.lastname,
        email: userExist.email,
      },
      process.env.SECRET,
      {
        expiresIn: "3d",
      }
    );

    // Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Send success response
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong.",
      error: error.message,
    });
  }
});

router.post("/signout", authenticateUser, (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({
    message: "Logged out successfully",
  });
});

router.get("/profile", authenticateUser, (req, res) => {
  const { firstname, lastname, email } = req.user;
  res.status(200).json({
    firstname,
    lastname,
    email,
  });
});

router.get("/users", async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
});

export default router;
