import * as bodyParser from "body-parser";
import express from "express";
import routes from "./routes";

class App {
  public app: express.Application;
  constructor() {
    this.app = express();

    this.initializeMiddleware();
    this.app.use(routes);
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());

    this.app.use(express.static("build/public"));

    this.app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", process.env.ACCESS_CONTROL_ALLOW_ORIGIN);
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });
  }

  public listen() {
    const port = process.env.API_PORT;
    this.app.listen(port, () => {
      console.log(`App listening on the port ${port}`);
    });
  }

  private initializeMiddleware() {
    this.app.use(bodyParser.json());
  }
}

export default App;
