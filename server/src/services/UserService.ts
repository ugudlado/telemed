import User from "../models/User";
import JwtUtility from "../utils/JwtUtility";

const users: User[] = [
    {
        userid: "Karthik",
        email: "karthik@mail.com",
        mobile: "987",
        name: "Karthik",
        role: "admin",
        password: "123456"
    },
    {
        userid: "Mahesh",
        email: "mahesh@mail.com",
        mobile: "456",
        name: "Mahesh",
        role: "doctor",
        password: "123456"
    },
    {
        userid: "Mani",
        email: "mani@mail.com",
        mobile: "123",
        name: "Mani",
        role: "assistant",
        password: "123456"
    },
    {
        userid: "john",
        email: "john@mail.com",
        mobile: "111",
        name: "John",
        role: "patient",
        password: "123456"
    }
];

class UserService {
    public authenticate(mobile: string, password: string) {
        const userProfile = users.find((u) => u.mobile === mobile && u.password === password);
        if (userProfile) {
            const jwt = new JwtUtility();
            const jwtToken = jwt.generateToken(userProfile);
            return jwtToken;
        } else {
            return null;
        }
    }

    public isAuthorized(token: string) {
        const jwt = new JwtUtility();
        return jwt.isTokenValid(token);
    }
}

export default UserService;
