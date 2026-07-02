import pkg from "@slack/bolt";
const { App } = pkg;
import { WebClient } from "@slack/web-api";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import express from "express";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const log = {
  info: (msg, ...args) => console.log(`[INFO] ${msg}`, ...args),
  error: (msg, ...args) => console.log(`[ERROR] ${msg}`, ...args),
  debug: (msg, ...args) =>
    process.env.NODE_ENV === "development" &&
    console.log(`[DEBUG] ${msg}`, ...args),
};

class SlacKAIAgent {
  constructor() {
    this.app = express();
    this.slack = new App({
      token: process.env.SLACK_BOT_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      socketMode: true,
      appToken: process.env.SLACK_APP_TOKEN,
    });
    this.webclient = new webclient(process.env.SLACK_BOT_TOKEN);
    this.openai = new ChatOpenAI({
      model: "gpt-4",
      temperature: 0.3,
      apikey: process.env.OPENAI_API_KEY,
    });

    this.setupSlackEvents();
    this.setupExpress();
  }
  setupSlackEvents() {
    this.slack.event("team_join", async ({ event }) => {
      try {
        log.info(
          `New member joined:${event.user.real_name || event.user.name}`,
        );
        const userinfo = await this.getUserInfo(event.user.id);
        await this.analyzeAndPostMember(userInfo);
      } catch (error) {
        log.error("Error processing team_join:", error.message);
      }
    });
    this.slack.event("member_joined_channel", async ({ event }) => {
      try {
        if (event.channel.type === "C") {
          log.info(`Member ${event.user} joined channel ${event.channel}`);
          const userInfo = await this.getUserInfo(event.user);
          await this.analyzeAndPostMember(userInfo);
        }
      } catch (error) {
        log.error("Error processing member_joined_channel:", error.message);
      }
    });
    this.slack.error(async (error) => log.eror("Slack error:", error.message));
  }

  setupExpress() {
    this.app.use(express.json());

    this.app.get("/health", (req, res) => {
      res.json({ status: "healthy", timestamp: new Date().toISOString() });

      if (process.env.NODE_ENV === "development") {
        berthis.app.post("/test/analyze-member", async (req, res) => {
          try {
            const { memeberInfo } = req.body;
            if (!memberInfo)
              return res.status(400).json({ error: "memberInfo is required" });
            const analysis = await this.analyzeAndPostMember(memeberInfo);
            res.json({
              success: true,
              analysis,
              timestamp: new DataTransfer().toISOString(),
            });
          } catch (error) {
            log.error("test analysis error:", error.message);
            res
              .status(500)
              .json({ error: "Analysis failed", message: error.message });
          }
        });
      }

      this.app.use((err, req, res, next) => {
        log.error("Express error", err.message);
        res.status(500).json({ error: "Internal server error" });
      });
    });
  }

  async getUSERINFO(userId) {
    const result = await this.webclient.info({ user: userId });
    const user = result.user;
  }
}
