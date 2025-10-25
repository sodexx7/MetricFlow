Operations

      uniswap


            1000 USDC
            1000 USDC approve for usdc/weth pool
            500USDC swap for weth

            500USDC + swaped weth supply for liqudity



      Compound
            1000 usdc
            1000 usdc approve usdc lending
            1

Doing:
make swap and providing liqudity together

involveds more complex parts. how to deal with them?

uniswap v3 exmaple

      https://docs.uniswap.org/contracts/v3/guides/providing-liquidity/mint-a-position

Doing:

1. check uniswap v3 abi supply / compound lending token abi

check ai's code

         1) for now only support liqudity
               doing make the test passed
         2) Data structure define problems?
               1) can compitable with all the possible operations
               2)
         2) check the EIP712 all data usage whether or not appropriate?
               SmartContract (should consider this situaitons, not each time should inlcude all operations)
                  SAWP. LP

         3) No need to specify whcih token as the supply token.
         4) related protocol abi check.
               can test firstly b
         3) useNouce correctly using?
         4) prepare the related scripts (for test and front-end)
         5)

1. how to desgin user's actions with AA?
   quick mvp

   user deposit tokens. and smart contract maintain the relationships between the token and user's address?

   user's operations
   approve
   provoding liqudiity
   lending tokens

2. add verification logic
   EIP712

   define EIP721

3. whether or not should use factory related params?

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

1. Current only support network arbitrium
2. Currnet support protocols and related operations

   ??? choose which pool deposit? which aseet supply?

   2.1 **Compound Lending (50%):** Supply assets such as USDC or ETH to Compound to earn lending interest. Steps: Deposit tokens into Compound through a supported wallet, and interest accrues automatically based on utilization rates.

   2.2 **Uniswap V3 Yield Farming (50%):** Provide concentrated liquidity in Uniswap V3 pools for higher fee earnings (note: requires active management or use of automation tools). Steps: Select a high-volume pair, set custom liquidity ranges, and monitor/ adjust positions periodically to maximize fees.
