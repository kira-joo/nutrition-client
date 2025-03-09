import React from "react";

interface LoadingProps {
  loading: boolean;
}

const Loading: React.FC<LoadingProps> = ({ loading }) => {
  return loading ? <p>Sending...</p> : null;
};

export default Loading;
