import assert from "assert";
import { 
  TestHelpers,
  ETHUSDC005_Burn
} from "generated";
const { MockDb, ETHUSDC005 } = TestHelpers;

describe("ETHUSDC005 contract Burn event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for ETHUSDC005 contract Burn event
  const event = ETHUSDC005.Burn.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("ETHUSDC005_Burn is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await ETHUSDC005.Burn.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualETHUSDC005Burn = mockDbUpdated.entities.ETHUSDC005_Burn.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedETHUSDC005Burn: ETHUSDC005_Burn = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      owner: event.params.owner,
      tickLower: event.params.tickLower,
      tickUpper: event.params.tickUpper,
      amount: event.params.amount,
      amount0: event.params.amount0,
      amount1: event.params.amount1,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualETHUSDC005Burn, expectedETHUSDC005Burn, "Actual ETHUSDC005Burn should be the same as the expectedETHUSDC005Burn");
  });
});
