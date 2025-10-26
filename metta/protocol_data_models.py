from uagents import Model
from enum import Enum
from typing import Optional


class ProtocolType(Enum):
   AMM = "AMM"
   LENDING = "LENDING"

class OperationType(Enum):
    SWAP = "swap"
    LENDING = "lending"
    BORROWING = "borrowing"
    BRIDGE = "bridge"
    LP = "yield_farming"

class Network(Enum):
    ARB = "arbitrum"
    BASE = "base"
    

# below config current is fixed. for example. listed to eth/usdc(0.005 fee) pair address. which get by current protocol's config
#################################################################################################################################
class AMMConfig(Model):
    pair_name: str
    pair_address: str
    network: Network
    tokenA_address: str
    tokenB_address: str
    
    class Config:
        use_enum_values = True

# Below data is empty, just help front-end decide which metrics should monitor
class AMMMetric(Enum):
    current_price = "current_price"
    liquidity_volume = "liquidity_volume"
    avg_liquidity_7day = "avg_liquidity_7day"

    # trading_pair, current_price, liquidity_volume, 7day_avg_liquidity, impermanent_loss

class AMMProtocol(Model):
    name: str
    type: ProtocolType
    ammConfig: AMMConfig
    
    class Config:
        use_enum_values = True
  
class AMMStrategy(Model):
    protocol: AMMProtocol
    metrics: Optional[list[AMMMetric]] = None
    # AMM only support swap and lp operations
    operation: Optional[OperationType] = None
    # for specific swap operation, let user define the amount?
    
    class Config:
        use_enum_values = True

#################################################################################################################################
# lending strategy
class LendingConfig(Model):
    address_name: str
    lending_token_address: str
    # todo add other necessary info

# Below data is empty, just help front-end decide which metrics should monitor
class LendingMetric(Enum):
    tvl = "tvl"
    expected_yield = "expected_yield"
    # todo add other necessary info

class LendingProtocol(Model):
    name: str
    type: ProtocolType
    lendingConfig: LendingConfig
    
    class Config:
        use_enum_values = True

class LendingStrategy(Model):
    protocol: LendingProtocol
    metrics: Optional[list[LendingMetric]] = None
    operation: Optional[OperationType] = None
    
    class Config:
        use_enum_values = True


#################################################################################################################################


class Strategy(Model):
    strategy: LendingStrategy | AMMStrategy
    
    class Config:
        use_enum_values = True
   


    

