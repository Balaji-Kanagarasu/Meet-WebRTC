import React, { useEffect } from "react";
import { CreateButton } from "../../components/CreateButton";

const Home: React.FC = () => {
  return (
    <div className="App w-screen h-screen flex items-center justify-center">
      <CreateButton />
    </div>
  );
};

export default Home;
