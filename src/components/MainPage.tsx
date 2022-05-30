import React from "react";

type MainPageProps = {
  children: React.ReactNode;
};

const MainPage = ({
  children,
}: MainPageProps): JSX.Element => {

  return (
    <div className="main-box">
      <div className="title">
        <h1>DeMove</h1>
      </div>
      <div id="dialog">
        <header>Welcome to DeMove!</header>
        <div id="content">
          <p>Hello!</p>
          <p>
            DeMove is a decentralized food delivery platform.
            You can browse the restaurants now. If you are interested, connect with your wallet and start ordering / delivering / selling!
            <br />
          </p>
        </div>
        <div className="buttons">
          {children}
        </div>
      </div>
      <div id="footer">
        <img src="built-with-taquito.png" alt="Built with Taquito" />
      </div>
    </div>
  );

};

export default MainPage;
