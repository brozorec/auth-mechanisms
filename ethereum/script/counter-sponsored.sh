OWNER_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
OWNER_PK=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
SENDER_PK=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

DELEGATE_CONTRACT=$(forge create Delegate --private-key $SENDER_PK --broadcast | awk '/Deployed to: / {addr=$3} END {print addr}')
echo "Delegate Contract deployed to: $DELEGATE_CONTRACT"

SIGNED_AUTH=$(cast wallet sign-auth $DELEGATE_CONTRACT --private-key $OWNER_PK)

cast send --quiet $OWNER_ADDRESS "execute((bytes,address,uint256)[])" "[("0x",$(cast az),0)]" --private-key $SENDER_PK --auth $SIGNED_AUTH
#cast code $OWNER_ADDRESS

#COUNTER_CONTRACT=$(forge create Counter --private-key $SENDER_PK --broadcast --constructor-args $OWNER_ADDRESS | awk '/Deployed to: / {addr=$3} END {print addr}')
#echo "Counter Contract deployed to: $COUNTER_CONTRACT"

#read from .counter_addr
COUNTER_CONTRACT=$(cat script/.counter_addr)
echo "Loaded Counter Contract: $COUNTER_CONTRACT"

cast send $OWNER_ADDRESS "execute((bytes,address,uint256)[])" "[($(cast sig 'increment()'),$COUNTER_CONTRACT,0)]" --private-key $SENDER_PK -- --broadcast | awk '/transactionHash/ {hash=$2} END {print hash}' | xargs cast tx --json > script/counter-sponsored.json

#cast call $COUNTER_CONTRACT "counter()"
