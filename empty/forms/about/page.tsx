"use client";

import { ObjectId } from "mongodb";
import React, { useEffect, useState } from "react";
import classes from "./Details.module.css";

interface Data {
  _id: ObjectId;
  from: string;
  to: string;
  text: string;
  phone?: string;
}

const DataPage = () => {
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3333/mail");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (err) {
        setError("there is something wrong, try again later");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p className={classes.loading}>Loading data...</p>;
  }

  if (error) {
    return <p className={classes.error}>{error}</p>;
  }

  return (
    <div className={classes.container}>
      <h1 className={classes.heading}>Messages</h1>
      {data.length === 0 ? (
        <p className={classes.noData}>No messages available</p>
      ) : (
        <ul className={classes.list}>
          {data.map((item) => (
            <li key={item._id.toString()} className={classes.rectangleBox}>
              <p>From: {item.from}</p>
              <p>To: {item.to}</p>
              <p className={classes.messageText}>Message: {item.text}</p>
              {item.phone && <p>Phone: {item.phone}</p>}
              <hr />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DataPage;
