import jwt from "jsonwebtoken";

export const generateToken = (id) => {
    return jwt.sign({ id }, "jwtsecret", { expiresIn: "7d" });
};

