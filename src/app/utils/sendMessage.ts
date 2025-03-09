import { postRequest } from "../api/post";

export const sendEmail = async (data: {
  email: string;
  message: string;
  phone?: string;
}) => {
  return await postRequest("mail", data);
};
