import React from "react";

type ChooseRolePageProps = {
  children: React.ReactNode;
};

const ChooseRolePage = ({
  children,
}: ChooseRolePageProps): JSX.Element => {

  return (
    <div className="main-box">
      <div className="title">
        <h1>DeMove</h1>
      </div>
      <div id="dialog">
        <header>Choose your role!</header>
        <div id="content">
        </div>
        <div className="buttons" style={{flexDirection: 'column'}}>
          {children}
        </div>
      </div>
      <div id="footer">
        <img src="built-with-taquito.png" alt="Built with Taquito" />
      </div>
    </div>
  );

};

export default ChooseRolePage;
