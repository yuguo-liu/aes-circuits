import { WitnessTester } from "circomkit";
import { bitArrayToHex, circomkit, hexByteToBigInt, hexToBitArray } from ".";
import { assert } from "chai";

describe("reverse_byte_array", () => {
  let circuit: WitnessTester<["in"], ["out"]>;

  before(async () => {
    circuit = await circomkit.WitnessTester(`reverse_bytes`, {
      file: "aes-gcm/utils",
      template: "ReverseByteArray128",
    });
  });

  it("test reverse_byte_array", async () => {
    let bits = hexToBitArray("0102030405060708091011121314151f");
    let expect = "1f151413121110090807060504030201";
    const _res = await circuit.compute({ in: bits }, ["out"]);
    const result = bitArrayToHex(
      (_res.out as number[]).map((bit) => Number(bit))
    );
    // console.log("expect: ", expect, "\nresult: ", result);
    assert.equal(expect, result);
  });
});


describe("IncrementWord", () => {
  let circuit: WitnessTester<["in"], ["out"]>;
  it("should increment the word input", async () => {
      circuit = await circomkit.WitnessTester(`IncrementByte`, {
          file: "aes-gcm/utils",
          template: "IncrementWord",
      });
      await circuit.expectPass(
          {
              in: [0x00, 0x00, 0x00, 0x00],
          },
          {
              out: [0x00, 0x00, 0x00, 0x01],
          }
      );

  });
  it("should increment the word input on overflow", async () => {
      circuit = await circomkit.WitnessTester(`IncrementWord`, {
          file: "aes-gcm/utils",
          template: "IncrementWord",
      });
      await circuit.expectPass(
          {
              in: [0x00, 0x00, 0x00, 0xFF],
          },
          {
              out: [0x00, 0x00, 0x01, 0x00],
          }
      );
  });
  it("should increment the word input on overflow", async () => {
      circuit = await circomkit.WitnessTester(`IncrementWord`, {
          file: "aes-gcm/utils",
          template: "IncrementWord",
      });
      await circuit.expectPass(
          {
              in: [0xFF, 0xFF, 0xFF, 0xFF],
          },
          {
              out: [0x00, 0x00, 0x00, 0x00],
          }
      );
  });
});


describe("ParseBytesBE", () => {
  let circuit: WitnessTester<["in"], ["out"]>;

  before(async () => {
    circuit = await circomkit.WitnessTester(`ParseBEBytes64`, {
      file: "aes-gcm/utils",
      template: "ParseBEBytes64",
    });
  });

  it("Should parse bytes in BE order", async () => {
    const X = hexToBitArray("0x0000000000000001");
    const expected = 1;
    const _result = await circuit.compute({ in: X }, ["out"]);
    const result = _result.out as number;

    assert.equal(result, expected, "parse incorrect");
  });
});


describe("ParseBytesLE", () => {
  let circuit: WitnessTester<["in"], ["out"]>;

  before(async () => {
    circuit = await circomkit.WitnessTester(`ParseLEBytes64`, {
      file: "aes-gcm/utils",
      template: "ParseLEBytes64",
    });
  });

  it("Should parse bytes in LE order", async () => {
    const X = hexToBitArray("0x0100000000000000");
    const expected = 1;
    const _result = await circuit.compute({ in: X }, ["out"]);
    const result = _result.out as number;

    assert.equal(result, expected, "parse incorrect");
  });
});

describe("ArrayMux", () => {
  let circuit: WitnessTester<["a", "b", "sel"], ["out"]>;

  before(async () => {
    circuit = await circomkit.WitnessTester("XORBLOCK", {
      file: "aes-gcm/utils",
      template: "ArrayMux",
      params: [16]
    });
    console.log("#constraints:", await circuit.getConstraintCount());
  });
  // msb is 1 so we xor the first byte with 0xE1
  it("Should Compute selector mux Correctly", async () => {
    let a = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
    let b = [0xE1, 0xE1, 0xE1, 0xE1, 0xE1, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01];
    let sel = 0x00;
    let expected = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
    await circuit.expectPass({ a: a, b: b, sel: sel }, { out: expected });
  });

  it("Should Compute block XOR Correctly", async () => {
    let a = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
    let b = [0xE1, 0xE1, 0xE1, 0xE1, 0xE1, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01];
    let sel = 0x01;
    let expected = [0xE1, 0xE1, 0xE1, 0xE1, 0xE1, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01];
    await circuit.expectPass({ a: a, b: b, sel: sel }, { out: expected });
  });

});
describe("XORBLOCK", () => {
  let circuit: WitnessTester<["a", "b"], ["out"]>;

  before(async () => {
    circuit = await circomkit.WitnessTester("XORBLOCK", {
      file: "aes-gcm/utils",
      template: "XORBLOCK",
      params: [16]
    });
    console.log("#constraints:", await circuit.getConstraintCount());
  });
  // msb is 1 so we xor the first byte with 0xE1
  it("Should Compute block XOR Correctly", async () => {
    let inputa = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
    let inputb = [0xE1, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01];
    const expected = [0xE1, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01];
    await circuit.expectPass({ a: inputa, b: inputb }, { out: expected });
  });
});

describe("ToBytes", () => {
  let circuit: WitnessTester<["in"], ["out"]>;

  before(async () => {
    circuit = await circomkit.WitnessTester("bytesToBits", {
      file: "aes-gcm/utils",
      template: "BitsToBytes",
      params: [1]
    });
    console.log("#constraints:", await circuit.getConstraintCount());
  });

  it("Should Compute bytesToBits Correctly", async () => {
    let input = hexToBitArray("0x01");
    const expected = hexByteToBigInt("0x01");
    // console.log("expected", expected);
    const _res = await circuit.compute({ in: input }, ["out"]);
    // console.log("res:", _res.out);
    assert.deepEqual(_res.out, expected);
  });
  it("Should Compute bytesToBits Correctly", async () => {
    let input = hexToBitArray("0xFF");
    const expected = hexByteToBigInt("0xFF");
    // console.log("expected", expected);
    const _res = await circuit.compute({ in: input }, ["out"]);
    // console.log("res:", _res.out);
    assert.deepEqual(_res.out, expected);
  });
});

describe("ToBits", () => {
  let circuit: WitnessTester<["in"], ["out"]>;

  before(async () => {
    circuit = await circomkit.WitnessTester("bytesToBits", {
      file: "aes-gcm/utils",
      template: "BytesToBits",
      params: [2]
    });
    console.log("#constraints:", await circuit.getConstraintCount());
  });

  it("Should Compute bytesToBits Correctly", async () => {
    let input = [0x01, 0x00];
    const expected = hexToBitArray("0x0100");
    // console.log("expected", expected);
    const _res = await circuit.expectPass({ in: input }, { out: expected });
  });
  it("Should Compute bytesToBits Correctly", async () => {
    let input = [0xFF, 0x00];
    const expected = hexToBitArray("0xFF00");
    // console.log("expected", expected);
    const _res = await circuit.expectPass({ in: input }, { out: expected });
  });
});