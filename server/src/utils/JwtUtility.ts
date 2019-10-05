class JwtUtility {
    private jwt = require("jsonwebtoken");
    private salt: string = "VERY SECRET";
    public generateToken(object: any) {
        return this.jwt.sign(JSON.stringify(object), this.salt);
    }

    public isTokenValid(token: string) {
        return this.jwt.verify(token, this.salt, (error: string, decoded: string) => {
            if (decoded) {
                return true;
            }
            console.log(error);
            return false;
        });
    }
}

export default JwtUtility;
