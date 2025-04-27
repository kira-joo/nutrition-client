"use server";
export const fetchAllMessages = async () => {
  const data = await fetch("http://localhost:3333/mail");

  return data.json();
};
