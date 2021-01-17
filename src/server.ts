import express, { Application } from "express";
import multer from "multer";
import { createServer as createHttpServer, Server as HTTPServer } from "http";
import path from "path";
import fs from "fs";
import { analyze } from "./analysis";

export class Server {
  private app: Application;
  private httpServer: HTTPServer;

  private readonly HTTP_PORT = 8080;

  /**
   * Constructor
   */
  constructor() {
    this.app = express();
    this.httpServer = createHttpServer(this.app);
    this.app.use(express.static(path.join(__dirname, "../public")));
    const upload = multer({
      dest: path.join(__dirname, "..", "public/uploads/"),
    }).single("file");

    // GET /
    // ---
    this.app.get("/", (req, res) => {
      res.sendFile("index.html");
    });

    // POST /analyze
    // ---
    this.app.post("/analyze", upload, async (req, res) => {
      const { path } = req["file"];
      const analysis = await analyze(path);
      fs.unlinkSync(path);
      res.send(analysis);
    });
  }

  /**
   * Listen to incoming events.
   */
  public listen(callback: (protocol: string, port: number) => void): void {
    this.httpServer.listen(this.HTTP_PORT, () => {
      callback("http", this.HTTP_PORT);
    });
  }
}
