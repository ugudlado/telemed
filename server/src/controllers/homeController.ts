import * as express from "express";
import UserService from "../services/UserService";

class HomeController {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public sendHello = (request: express.Request, response: express.Response) => {
    response.send("Hello World!");
  }

  public authenticate = (request: express.Request, response: express.Response) => {
    const jwtToken = this.userService.authenticate(request.body.mobile, request.body.password);
    if (jwtToken == null) {
      response.status(401).send("Incorrect login credentials");
    } else {
      response.status(200).send(jwtToken);
    }
  }

  public refreshToken = (request: express.Request, response: express.Response) => {
    const refreshedToken = this.userService.refreshToken(request.headers.authorization);
    if (refreshedToken == null) {
      response.status(401).send("Invalid token");
    } else {
      response.status(200).send(refreshedToken);
    }
  }
}

export default HomeController;
