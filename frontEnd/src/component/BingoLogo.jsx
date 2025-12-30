import React from "react";
import {useNavigate} from "react-router-dom"
const BingoLogo = ({ size = "w-16 h-16" }) => {
  const gridItems = Array(5).fill(0); // 5 dots in a diagonal
  const navigate = useNavigate();
  return (
    <div
      className={`flex items-center justify-center ${size} bg-primary rounded-full shadow-lg transition-colors duration-300`}
       onClick={()=>navigate("/lobby")}
  >
      <div className="bg-surface w-[55%] h-[55%] rounded-2xl shadow-inner grid grid-cols-3 grid-rows-3 p-[12%] gap-[8%] transition-colors duration-300">
        {Array.from({ length: 9 }, (_, i) =>
          i % 2 === 0 ? ( // Place dots on positions 0,2,4,6,8
            <div key={i} className="flex items-center justify-center">
              <div className="w-full h-full max-w-[12px] max-h-[12px] rounded-full bg-primary transition-colors duration-300" />
            </div>
          ) : (
            <div key={i}></div>
          )
        )}
      </div>
    </div>
  );
};

export default BingoLogo;
