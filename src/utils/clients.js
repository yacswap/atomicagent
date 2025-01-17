const { Client } = require('@liquality/client')
const { assets } = require('@yac-swap/cryptoassets')
const config = require('../config')

const secretManager = require('./secretManager')

const { BitcoinRpcProvider } = require('@yac-swap/bitcoin-rpc-provider')
const { BitcoinSwapProvider } = require('@yac-swap/bitcoin-swap-provider')
const { BitcoinNodeWalletProvider } = require('@yac-swap/bitcoin-node-wallet-provider')
const { BitcoinJsWalletProvider } = require('@yac-swap/bitcoin-js-wallet-provider')
const { BitcoinEsploraBatchApiProvider } = require('@yac-swap/bitcoin-esplora-batch-api-provider')
const { BitcoinEsploraSwapFindProvider } = require('@yac-swap/bitcoin-esplora-swap-find-provider')
const { BitcoinFeeApiProvider } = require('@yac-swap/bitcoin-fee-api-provider')
const { BitcoinRpcFeeProvider } = require('@yac-swap/bitcoin-rpc-fee-provider')
const { BitcoinNetworks } = require('@yac-swap/bitcoin-networks')

const { YacoinSwapProvider } = require('@yac-swap/yacoin-swap-provider')
const { YacoinJsWalletProvider } = require('@yac-swap/yacoin-js-wallet-provider')
const { YacoinEsploraApiProvider } = require('@yac-swap/yacoin-esplora-api-provider')
const { YacoinEsploraSwapFindProvider } = require('@yac-swap/yacoin-esplora-swap-find-provider')
const { YacoinFeeApiProvider } = require('@yac-swap/yacoin-fee-api-provider')
const { YacoinNetworks } = require('@yac-swap/yacoin-networks')

const { EthereumRpcProvider } = require('@yac-swap/ethereum-rpc-provider')
const { EthereumJsWalletProvider } = require('@yac-swap/ethereum-js-wallet-provider')
const { EthereumSwapProvider } = require('@yac-swap/ethereum-swap-provider')
const { EthereumErc20Provider } = require('@yac-swap/ethereum-erc20-provider')
const { EthereumErc20SwapProvider } = require('@yac-swap/ethereum-erc20-swap-provider')
const { EthereumNetworks } = require('@yac-swap/ethereum-networks')
const { EthereumScraperSwapFindProvider } = require('@yac-swap/ethereum-scraper-swap-find-provider')
const { EthereumErc20ScraperSwapFindProvider } = require('@yac-swap/ethereum-erc20-scraper-swap-find-provider')
const { EthereumEIP1559FeeProvider } = require('@yac-swap/ethereum-eip1559-fee-provider')
const { EthereumRpcFeeProvider } = require('@yac-swap/ethereum-rpc-fee-provider')

const { NearSwapProvider } = require('@liquality/near-swap-provider')
const { NearJsWalletProvider } = require('@liquality/near-js-wallet-provider')
const { NearRpcProvider } = require('@liquality/near-rpc-provider')
const { NearSwapFindProvider } = require('@liquality/near-swap-find-provider')
const { NearNetworks } = require('@liquality/near-networks')

const { SolanaNetworks } = require('@liquality/solana-networks')
const { SolanaRpcProvider } = require('@liquality/solana-rpc-provider')
const { SolanaWalletProvider } = require('@liquality/solana-wallet-provider')
const { SolanaSwapProvider } = require('@liquality/solana-swap-provider')
const { SolanaSwapFindProvider } = require('@liquality/solana-swap-find-provider')

const { TerraNetworks } = require('@liquality/terra-networks')
const { TerraRpcProvider } = require('@liquality/terra-rpc-provider')
const { TerraWalletProvider } = require('@liquality/terra-wallet-provider')
const { TerraSwapProvider } = require('@liquality/terra-swap-provider')
const { TerraSwapFindProvider } = require('@liquality/terra-swap-find-provider')

async function createBtcClient() {
  const btcConfig = config.assets.BTC
  const network = BitcoinNetworks[btcConfig.network]

  if (btcConfig.addressType === 'p2sh-segwit') {
    throw new Error('Wrapped segwit addresses (p2sh-segwit) are currently unsupported.')
  }

  const btcClient = new Client()
  if (btcConfig.wallet && btcConfig.wallet.type === 'js') {
    const mnemonic = await secretManager.getMnemonic('BTC')

    btcClient.addProvider(
      new BitcoinEsploraBatchApiProvider({
        batchUrl: btcConfig.batchApi.url,
        url: btcConfig.api.url,
        network: network,
        numberOfBlockConfirmation: btcConfig.feeNumberOfBlocks
      })
    )

    btcClient.addProvider(
      new BitcoinJsWalletProvider({
        network: network,
        mnemonic,
        baseDerivationPath: `m/84'/${network.coinType}'/0'`
      })
    )
  } else {
    btcClient.addProvider(
      new BitcoinRpcProvider({
        uri: btcConfig.rpc.url,
        username: btcConfig.rpc.username,
        password: btcConfig.rpc.password,
        network: network,
        feeBlockConfirmations: btcConfig.feeNumberOfBlocks
      })
    )
    btcClient.addProvider(
      new BitcoinNodeWalletProvider({
        network: network,
        uri: btcConfig.rpc.url,
        username: btcConfig.rpc.username,
        password: btcConfig.rpc.password,
        addressType: btcConfig.addressType
      })
    )
  }

  btcClient.addProvider(
    new BitcoinSwapProvider({
      network: network,
      mode: btcConfig.swapMode
    })
  )

  if (btcConfig.wallet && btcConfig.wallet.type === 'js') {
    // Override swap finding with esplora
    btcClient.addProvider(new BitcoinEsploraSwapFindProvider(btcConfig.api.url))
  }

  if (network.isTestnet) {
    btcClient.addProvider(new BitcoinRpcFeeProvider())
  } else {
    btcClient.addProvider(new BitcoinFeeApiProvider('https://liquality.io/swap/mempool/v1/fees/recommended'))
  }

  return btcClient
}

async function createYacClient() {
  const yacConfig = config.assets.YAC
  const network = YacoinNetworks[yacConfig.network]

  const yacClient = new Client()
  if (yacConfig.wallet && yacConfig.wallet.type === 'js') {
    const mnemonic = await secretManager.getMnemonic('YAC')

    yacClient.addProvider(
      new YacoinEsploraApiProvider({
        url: yacConfig.api.esploraUrl,
        network: network,
        numberOfBlockConfirmation: yacConfig.feeNumberOfBlocks
      })
    )

    yacClient.addProvider(
      new YacoinJsWalletProvider({
        network: network,
        mnemonic,
        baseDerivationPath: `m/84'/${network.coinType}'/0'`
      })
    )
  }

  // CURRENTLY, HAVEN'T SUPPORTED TO USE COINS FROM YACOIND
  // else {
  //   yacClient.addProvider(
  //     new BitcoinRpcProvider({
  //       uri: yacConfig.rpc.url,
  //       username: yacConfig.rpc.username,
  //       password: yacConfig.rpc.password,
  //       network: network,
  //       feeBlockConfirmations: yacConfig.feeNumberOfBlocks
  //     })
  //   )
  //   yacClient.addProvider(
  //     new BitcoinNodeWalletProvider({
  //       network: network,
  //       uri: yacConfig.rpc.url,
  //       username: yacConfig.rpc.username,
  //       password: yacConfig.rpc.password,
  //       addressType: yacConfig.addressType
  //     })
  //   )
  // }

  yacClient.addProvider(
    new YacoinSwapProvider({
      network: network,
      mode: yacConfig.swapMode
    })
  )

  if (yacConfig.wallet && yacConfig.wallet.type === 'js') {
    // Override swap finding with esplora
    yacClient.addProvider(new YacoinEsploraSwapFindProvider(yacConfig.api.esploraSwapUrl))
  }

  yacClient.addProvider(new YacoinFeeApiProvider('https://liquality.io/swap/mempool/v1/fees/recommended'))

  return yacClient
}

async function createEthClient(asset) {
  const assetData = assets[asset]
  const assetConfig = config.assets[asset]
  let network = EthereumNetworks[assetConfig.network]
  if (network.name === 'local') {
    network = {
      ...network,
      name: 'mainnet',
      chainId: 1337,
      networkId: 1337,
      local: true
    }
  }

  const ethClient = new Client()
  const mnemonic = await secretManager.getMnemonic(asset)

  ethClient.addProvider(
    new EthereumRpcProvider({
      uri: assetConfig.rpc.url
    })
  )

  let feeProvider
  let eip1559 = false

  if (!network.local && (assetData.chain === 'ethereum' || (assetData.chain === 'polygon' && network.isTestnet))) {
    eip1559 = true
    feeProvider = new EthereumEIP1559FeeProvider({ uri: assetConfig.rpc.url })
  } else {
    feeProvider = new EthereumRpcFeeProvider()
  }

  ethClient.addProvider(feeProvider)

  ethClient.addProvider(
    new EthereumJsWalletProvider({
      network,
      mnemonic,
      derivationPath: `m/44'/${network.coinType}'/0'/0/0`,
      hardfork: eip1559 ? 'london' : undefined
    })
  )

  if (assetData.type === 'erc20') {
    const contractAddress = assetConfig.contractAddress
    ethClient.addProvider(new EthereumErc20Provider(contractAddress))
    ethClient.addProvider(new EthereumErc20SwapProvider())
    ethClient.addProvider(new EthereumErc20ScraperSwapFindProvider(assetConfig.scraper.url))
  } else {
    ethClient.addProvider(new EthereumSwapProvider())
    ethClient.addProvider(new EthereumScraperSwapFindProvider(assetConfig.scraper.url))
  }

  return ethClient
}

async function createNearClient() {
  const nearConfig = config.assets.NEAR
  const defaultConfig = NearNetworks[nearConfig.network]
  const network = {
    ...defaultConfig,
    nodeUrl: nearConfig.rpc?.url || defaultConfig.nodeUrl
  }

  const nearClient = new Client()
  const mnemonic = await secretManager.getMnemonic('NEAR')
  if (nearConfig.wallet && nearConfig.wallet.type === 'js') {
    nearClient.addProvider(
      new NearJsWalletProvider({
        network,
        mnemonic,
        derivationPath: `m/44'/${network.coinType}'/0'`
      })
    )
  }

  nearClient.addProvider(new NearRpcProvider(network))
  nearClient.addProvider(new NearSwapProvider())
  nearClient.addProvider(new NearSwapFindProvider(network.helperUrl))

  return nearClient
}

async function createSolClient() {
  const solanaConfig = config.assets.SOL
  const defaultConfig = SolanaNetworks[solanaConfig.network]
  const solanaNetwork = {
    ...defaultConfig,
    nodeUrl: solanaConfig.rpc?.url || defaultConfig.nodeUrl
  }

  const solanaClient = new Client()
  const mnemonic = await secretManager.getMnemonic('SOL')
  const derivationPath = `m/44'/501'/${solanaNetwork.walletIndex}'/0'`
  solanaClient.addProvider(new SolanaRpcProvider(solanaNetwork))
  solanaClient.addProvider(
    new SolanaWalletProvider({
      network: solanaNetwork,
      mnemonic,
      derivationPath
    })
  )
  solanaClient.addProvider(new SolanaSwapProvider(solanaNetwork))
  solanaClient.addProvider(new SolanaSwapFindProvider(solanaNetwork))

  return solanaClient
}

async function createTerraClient(asset) {
  const terraConfig = config.assets[asset]
  const defaultConfig = TerraNetworks[terraConfig.network]
  const terraNetwork = {
    ...defaultConfig,
    nodeUrl: terraConfig.rpc?.url || defaultConfig.nodeUrl
  }

  const terraClient = new Client()
  const mnemonic = await secretManager.getMnemonic('LUNA')

  terraClient.addProvider(new TerraRpcProvider(terraNetwork, terraConfig.asset, terraConfig.feeAsset))
  terraClient.addProvider(
    new TerraWalletProvider({
      network: terraNetwork,
      mnemonic,
      baseDerivationPath: `'m/44'/${terraNetwork.coinType}'/0'`,
      asset: terraConfig.asset,
      feeAsset: terraConfig.feeAsset,
      stableFee: false
    })
  )
  terraClient.addProvider(new TerraSwapProvider(terraNetwork, terraConfig.asset))
  terraClient.addProvider(new TerraSwapFindProvider(terraNetwork, terraConfig.asset))

  return terraClient
}

const clients = {}

async function createClient(asset) {
  const assetData = assets[asset]

  if (assetData.chain === 'bitcoin') return createBtcClient()
  if (assetData.chain === 'yacoin') return createYacClient()
  if (assetData.chain === 'rsk') return createEthClient(asset)
  if (assetData.chain === 'bsc') return createEthClient(asset)
  if (assetData.chain === 'polygon') return createEthClient(asset)
  if (assetData.chain === 'avalanche') return createEthClient(asset)
  if (assetData.chain === 'arbitrum') return createEthClient(asset)
  if (assetData.chain === 'ethereum') return createEthClient(asset)
  if (assetData.chain === 'near') return createNearClient()
  if (assetData.chain === 'solana') return createSolClient()
  if (assetData.chain === 'terra') return createTerraClient(asset)

  throw new Error(`Could not create client for asset ${asset}`)
}

async function getClient(asset) {
  if (asset in clients) return clients[asset]
  const client = await createClient(asset)
  clients[asset] = client
  return client
}

module.exports = { getClient }
