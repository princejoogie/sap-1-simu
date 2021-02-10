import React, { useState } from "react";
import "./App.css";

function App() {
  const [memory, setMemory] = useState([
    { address: "0X00", value: "" },
    { address: "0X01", value: "" },
    { address: "0X02", value: "" },
    { address: "0X03", value: "" },
    { address: "0X04", value: "" },
    { address: "0X05", value: "" },
    { address: "0X06", value: "" },
    { address: "0X07", value: "" },
    { address: "0X08", value: "" },
    { address: "0X09", value: "" },
    { address: "0X0A", value: "" },
    { address: "0X0B", value: "" },
    { address: "0X0C", value: "" },
    { address: "0X0D", value: "" },
    { address: "0X0E", value: "" },
    { address: "0X0F", value: "" },
  ]);
  const [input, setInput] = useState(`set

0x09 10011100
0x0A 00110101
0x0B 01100111
0x0C 00010101
0x0D 00000110

endset

LDA 0x09
ADD 0x0A
OUT
LDA 0x0B
SUB 0x0C
OUT
SUB 0x0D
OUT
HLT
`);
  const [output, setOutput] = useState(["00000000"]);
  const [error, setError] = useState("");
  const [c, setC] = useState(0);

  function parseCode(code, setters, srcCode) {
    let setting = false;
    code.forEach((line) => {
      let [left, right] = line.split(" ");

      if (left === "SET") setting = true;
      else if (left === "ENDSET") setting = false;
      else if (setting) {
        let a = parseInt(right, 2);
        let b = (a >>> 0).toString(2).padStart(8, "0");
        setters.push({ left, right: b });
      } else {
        srcCode.push({ left, right });
      }
    });

    console.log({ setters, srcCode });

    let tempMem = [
      { address: "0X00", value: "" },
      { address: "0X01", value: "" },
      { address: "0X02", value: "" },
      { address: "0X03", value: "" },
      { address: "0X04", value: "" },
      { address: "0X05", value: "" },
      { address: "0X06", value: "" },
      { address: "0X07", value: "" },
      { address: "0X08", value: "" },
      { address: "0X09", value: "" },
      { address: "0X0A", value: "" },
      { address: "0X0B", value: "" },
      { address: "0X0C", value: "" },
      { address: "0X0D", value: "" },
      { address: "0X0E", value: "" },
      { address: "0X0F", value: "" },
    ];
    setters.forEach((x) => {
      let i = tempMem.findIndex(({ address }) => address === x.left);
      tempMem[i].value = x.right;
    });

    let counter = 0;
    let accumulator;
    let tempOutput = [];
    for (let i = 0; i < srcCode.length; i++) {
      let x = srcCode[i];
      if (x.left === "LDA") {
        try {
          let i = tempMem.findIndex(({ address }) => address === x.right);
          accumulator = tempMem[i].value;
          tempMem[counter].value =
            "0000 " + parseInt(x.right, 16).toString(2).padStart(4, "0");
          setError("");
        } catch (e) {
          setError(`Cant get value from ${x.right}`);
          break;
        }
      } else if (x.left === "ADD") {
        try {
          if (accumulator) {
            let i = tempMem.findIndex(({ address }) => address === x.right);
            let val = tempMem[i].value;
            let res = parseInt(accumulator, 2) + parseInt(val, 2);
            let final = (res >>> 0).toString(2);
            accumulator = final;
            tempMem[counter].value =
              "0001 " + parseInt(x.right, 16).toString(2).padStart(4, "0");
            setError("");
          } else {
            setError("No accumulator");
            break;
          }
        } catch (e) {
          setError(`Cant get value from ${x.right}`);
          break;
        }
      } else if (x.left === "SUB") {
        try {
          if (accumulator) {
            let i = tempMem.findIndex(({ address }) => address === x.right);
            let val = tempMem[i].value;
            let res = parseInt(accumulator, 2) - parseInt(val, 2);
            let final = (res >>> 0).toString(2);
            accumulator = final;
            tempMem[counter].value =
              "0010 " + parseInt(x.right, 16).toString(2).padStart(4, "0");
            setError("");
          } else {
            setError("No accumulator");
            break;
          }
        } catch (e) {
          setError(`Cant get value from ${x.right}`);
          break;
        }
      } else if (x.left === "OUT") {
        if (accumulator) {
          tempMem[counter].value = "1110";
          tempOutput.push(accumulator);
          setError("");
        } else {
          setError("No accumulator");
          break;
        }
      } else if (x.left === "HLT") {
        tempMem[counter].value = "1111";
        break;
      }
      counter++;
    }

    setOutput(tempOutput);
    setMemory(tempMem);
    setC(c + 1);
  }

  function compileCode() {
    let setters = [];
    let srcCode = [];
    let code = input.split(/\r?\n/);
    code = code
      .map((x) =>
        x
          .toUpperCase()
          .trim()
          .replace(/ +(?= )/g, "")
      )
      .filter((x) => x !== "");
    parseCode(code, setters, srcCode);
  }

  return (
    <div className="container">
      <h2>SAP-1 Simulator</h2>
      <div className="upper">
        <textarea
          rows="30"
          cols="30"
          id="source-code"
          form="usrform"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        ></textarea>
        <div className="address-list">
          <div className="address-content">
            <p>Address</p>
            <p>Value</p>
          </div>
          {memory.map((x, i) => (
            <div key={x.address + i} className="address-content">
              <p>{x.address}</p>
              <p>{x.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="lower">
        <button id="compile" onClick={compileCode}>
          Compile
        </button>
        <p id="output">
          Error: <span>{error}</span>
        </p>
      </div>
      <br />
      <h4>OUTPUT</h4>
      <div>
        {output.map((x, i) => {
          return (
            <div className="output">
              {`OUT ${i + 1}`}
              &nbsp;
              {renderOutput(x)}
            </div>
          );
        })}
      </div>
      <div style={{ minHeight: "100px" }} />
    </div>
  );
}

function renderOutput(output) {
  let views = [];
  let len = output.length;

  if (len < 8) {
    for (let i = 0; i < 8 - len; i++) {
      views.push(<div key={"excess" + i} className="inactive" />);
    }
  }

  for (let i = 0; i < len; i++) {
    views.push(
      output[i] === "0" ? (
        <div key={"output" + i} className="inactive" />
      ) : (
        <div key={"output" + i} className="active"></div>
      )
    );
  }

  views.push(<br />);

  return views;
}

export default App;
