import passport from "passport";
import { IVerifyOptions } from "passport-local";
import { default as User, UserModel } from "../models/User";
import "../config/passport";
import { Request, Response, NextFunction } from "express";