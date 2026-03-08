import hre from "hardhat";

export async function main() {
  console.log("hre keys:", Object.keys(hre));
  console.log("hre.ethers:", hre.ethers);
  if (hre.ethers) {
    console.log("hre.ethers keys:", Object.keys(hre.ethers));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
