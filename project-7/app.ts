const num1Element = document.getElementById("num1") as HTMLInputElement;
const num2Element = document.getElementById("num2") as HTMLInputElement;
const buttonElement = document.querySelector("button")!;

const numResults: number[] = [];
const textResults: string[] = [];

type numOrString = number | string;
type result = { val: number; timestamp: Date };

interface resultObj {
  val: number;
  timestamp: Date;
}

function add(num1: numOrString, num2: numOrString) {
  if (typeof num1 === "number" && typeof num2 === "number") {
    return num1 + num2;
  } else if (typeof num1 === "string" && typeof num2 === "string") {
    return num1 + " " + num2;
  } else {
    return +num1 + +num2;
  }
}

function printResult(res: result) {
  console.log(res.val);
}

buttonElement.addEventListener("click", () => {
  const num1 = num1Element.value;
  const num2 = num2Element.value;

  const numResult = add(+num1, +num2) as number;
  const textResult = add(num1, num2) as string;

  numResults.push(numResult);
  textResults.push(textResult);

  printResult({ val: numResult as number, timestamp: new Date() });

  console.log(numResults, textResults);
});

const myPromise = new Promise<string>((resolve, reject) => {
  setTimeout(() => {
    resolve("It worked!");
  }, 1000);
});

myPromise.then((result) => console.log(result.split("w")));
