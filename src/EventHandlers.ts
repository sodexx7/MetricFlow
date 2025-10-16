/*
 *  Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  ETHUSDC005,
  ETHUSDC005_Burn,
  ETHUSDC005_Collect,
  ETHUSDC005_CollectProtocol,
  ETHUSDC005_Flash,
  ETHUSDC005_IncreaseObservationCardinalityNext,
  ETHUSDC005_Initialize,
  ETHUSDC005_Mint,
  ETHUSDC005_SetFeeProtocol,
  ETHUSDC005_Swap,
} from "generated";

ETHUSDC005.Burn.handler(async ({ event, context }) => {
  const entity: ETHUSDC005_Burn = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    owner: event.params.owner,
    tickLower: event.params.tickLower,
    tickUpper: event.params.tickUpper,
    amount: event.params.amount,
    amount0: event.params.amount0,
    amount1: event.params.amount1,
  };

  context.ETHUSDC005_Burn.set(entity);
});

ETHUSDC005.Collect.handler(async ({ event, context }) => {
  const entity: ETHUSDC005_Collect = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    owner: event.params.owner,
    recipient: event.params.recipient,
    tickLower: event.params.tickLower,
    tickUpper: event.params.tickUpper,
    amount0: event.params.amount0,
    amount1: event.params.amount1,
  };

  context.ETHUSDC005_Collect.set(entity);
});

ETHUSDC005.CollectProtocol.handler(async ({ event, context }) => {
  const entity: ETHUSDC005_CollectProtocol = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    sender: event.params.sender,
    recipient: event.params.recipient,
    amount0: event.params.amount0,
    amount1: event.params.amount1,
  };

  context.ETHUSDC005_CollectProtocol.set(entity);
});

ETHUSDC005.Flash.handler(async ({ event, context }) => {
  const entity: ETHUSDC005_Flash = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    sender: event.params.sender,
    recipient: event.params.recipient,
    amount0: event.params.amount0,
    amount1: event.params.amount1,
    paid0: event.params.paid0,
    paid1: event.params.paid1,
  };

  context.ETHUSDC005_Flash.set(entity);
});

ETHUSDC005.IncreaseObservationCardinalityNext.handler(
  async ({ event, context }) => {
    const entity: ETHUSDC005_IncreaseObservationCardinalityNext = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      observationCardinalityNextOld: event.params.observationCardinalityNextOld,
      observationCardinalityNextNew: event.params.observationCardinalityNextNew,
    };

    context.ETHUSDC005_IncreaseObservationCardinalityNext.set(entity);
  }
);

ETHUSDC005.Initialize.handler(async ({ event, context }) => {
  const entity: ETHUSDC005_Initialize = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    sqrtPriceX96: event.params.sqrtPriceX96,
    tick: event.params.tick,
  };

  context.ETHUSDC005_Initialize.set(entity);
});

ETHUSDC005.Mint.handler(async ({ event, context }) => {
  const entity: ETHUSDC005_Mint = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    sender: event.params.sender,
    owner: event.params.owner,
    tickLower: event.params.tickLower,
    tickUpper: event.params.tickUpper,
    amount: event.params.amount,
    amount0: event.params.amount0,
    amount1: event.params.amount1,
  };

  context.ETHUSDC005_Mint.set(entity);
});

ETHUSDC005.SetFeeProtocol.handler(async ({ event, context }) => {
  const entity: ETHUSDC005_SetFeeProtocol = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    feeProtocol0Old: event.params.feeProtocol0Old,
    feeProtocol1Old: event.params.feeProtocol1Old,
    feeProtocol0New: event.params.feeProtocol0New,
    feeProtocol1New: event.params.feeProtocol1New,
  };

  context.ETHUSDC005_SetFeeProtocol.set(entity);
});

ETHUSDC005.Swap.handler(async ({ event, context }) => {
  const entity: ETHUSDC005_Swap = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    sender: event.params.sender,
    recipient: event.params.recipient,
    amount0: event.params.amount0,
    amount1: event.params.amount1,
    sqrtPriceX96: event.params.sqrtPriceX96,
    liquidity: event.params.liquidity,
    tick: event.params.tick,
  };

  context.ETHUSDC005_Swap.set(entity);
});
