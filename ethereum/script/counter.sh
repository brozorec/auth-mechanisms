OWNER_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
OWNER_PK=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

COUNTER_CONTRACT=$(forge create Counter --private-key $OWNER_PK --broadcast --constructor-args $OWNER_ADDRESS | awk '/Deployed to: / {addr=$3} END {print addr}')
echo "Counter Contract deployed to: $COUNTER_CONTRACT"

echo $COUNTER_CONTRACT > script/.counter_addr

cast send $COUNTER_CONTRACT "increment()" --private-key $OWNER_PK -- --broadcast | awk '/transactionHash/ {hash=$2} END {print hash}' | xargs cast tx --json > script/counter.json

#forge script script/Counter.s.sol:CounterScript --fork-url http://localhost:8545 --broadcast | awk '/0x/ {hash=$1} END {print hash}' | xargs cast tx --json > script/counter.json
