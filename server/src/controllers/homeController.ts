import * as express from "express";

class HomeController {
  public sendHello = (request: express.Request, response: express.Response) => {
    response.send("Hello World!");
  }
}

export default HomeController;
