import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import RepoStarHistoryRetriever from 'lib/RepoStarHistoryRetriever'
import { generateIframeCode } from 'lib/helpers'
import IssueTracker from '~/components/IssueTracker'
import StarHistory from '~/components/StarHistory'
import Modal from '~/components/Modal'
import ExternalLink from '~/icons/ExternalLink'
import Clipboard from '~/icons/Clipboard'
import Check from '~/icons/Check'

const issuesTable = process.env.NEXT_PUBLIC_SUPABASE_ISSUES_TABLE
const starsTable = process.env.NEXT_PUBLIC_SUPABASE_STARS_TABLE

const RepositoryStatistics = ({ githubAccessToken, supabase, organization }) => {

  const router = useRouter()
  const repoName = router.query.repo

  const [showModal, setShowModal] = useState(false)
  const [iframeChartType, setIframeChartType] = useState('')
  const [codeCopied, setCodeCopied] = useState(false)
  const textAreaRef = useRef(null)

  const [issueCounts, setIssueCounts] = useState([])
  const [loadingIssueCounts, setLoadingIssueCounts] = useState(false)

  const [lastUpdated, setLastUpdated] = useState(null)
  const [starHistory, setStarHistory] = useState([])
  const [loadingStarHistory, setLoadingStarHistory] = useState(false)

  // An object of star history retrievers.
  // Example: {'supabase/supabase': RepoStarHistoryRetriever1, 'supabase/realtime': RepoStarHistoryRetriever2}
  const [starHistoryRetrievers, setStarHistoryRetrievers] = useState({})

  useEffect(() => {
    (async function retrieveRepositoryIssueCounts() {
      setLoadingIssueCounts(true)
      const { data, error } = await supabase
        .from(issuesTable)
        .select('*')
        .eq('organization', organization)
        .eq('repository', repoName)
      if (error) {
        console.error(error)
      } else if (data) {
        setIssueCounts(data)
      }
      setLoadingIssueCounts(false)
    })()
  }, [repoName])

  useEffect(() => {
    // First, check if a corresponding star history retriever exists.
    // If not, create a new one.
    const starHistoryKey = `${organization}/${repoName}`
    let starHistoryRetriever
    if (starHistoryKey in starHistoryRetrievers) {
      starHistoryRetriever = starHistoryRetrievers[starHistoryKey]
    } else {
      starHistoryRetriever = new RepoStarHistoryRetriever(supabase, starsTable, organization, repoName, githubAccessToken)
      const newRetrievers = Object.assign({}, starHistoryRetrievers)
      newRetrievers[starHistoryKey] = starHistoryRetriever
      setStarHistoryRetrievers(newRetrievers)
    }

    // In case the star history is already retrieved, load it on on this component.
    setStarHistory(starHistoryRetriever.starHistory)
    setLastUpdated(starHistoryRetriever.historyUpdateTime)
    setLoadingStarHistory(starHistoryRetriever.isLoading)

    // Then, subscribe to any change in the star history retriever.
    const { subscription } = starHistoryRetriever.onLoaded((starHistory, historyUpdateTime, isLoading) => {
      setStarHistory(starHistory)
      setLastUpdated(historyUpdateTime)
      setLoadingStarHistory(isLoading)
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [repoName])

  const retrieveLatestOpenIssueCount = () => {
    if (issueCounts.length > 0) {
      const latestCount = issueCounts[issueCounts.length - 1]
      return latestCount.open_issues
    } else {
      return 0
    }
  }

  const retrieveLatestCloseIssueCount = () => {
    if (issueCounts.length > 0) {
      const latestCount = issueCounts[issueCounts.length - 1]
      return latestCount.closed_issues
    } else {
      return 0
    }
  }

  const deriveOpenIssueCountComparison = () => {
    if (issueCounts.length > 0) {
      const formattedIssueCounts = issueCounts.map(repo => {
        return {
          open_issues: repo.open_issues,
          inserted_at: (Math.floor(new Date(repo.inserted_at) / 1000))
        }
      })

      const latestCount = formattedIssueCounts[formattedIssueCounts.length - 1]
      const previousDayTimestamp = latestCount.inserted_at - 86400
      const previousDayIssueCounts = formattedIssueCounts.filter(repo => {
        if (repo.inserted_at <= previousDayTimestamp) return repo
      })

      if (previousDayIssueCounts.length > 0) {
        const previousDayCount = previousDayIssueCounts[previousDayIssueCounts.length - 1]
        return (latestCount.open_issues - previousDayCount.open_issues)
      } else {
        return 0
      }
    } else {
      return 0
    }
  }

  const toggleEmbedModal = (chartType) => {
    setCodeCopied(false)
    setIframeChartType(chartType)
    setShowModal(true)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(textAreaRef.current.value)
    setCodeCopied(true)
  }

  return (
    <>
      <Modal
        showModal={showModal}
        onCloseModal={() => setShowModal(false)}
      >
        <div className="flex-1">
          <div className="flex items-center justify-between mb-5">
            <p className="text-white">Embed this chart</p>
            <div
              onClick={() => copyCode()}
              className={`
                rounded-md border border-gray-400 p-2 transition
                ${!codeCopied && 'cursor-pointer hover:bg-gray-500'}
              `}
            >
              {codeCopied ? <Check size={16} className="stroke-current text-brand-700" /> : <Clipboard size={16} />}
            </div>
          </div>
          <textarea
            ref={textAreaRef}
            value={generateIframeCode(organization, repoName, iframeChartType)}
            rows={4}
            readOnly
            className="w-full bg-gray-500 rounded-md p-3 font-mono text-sm text-white"
            style={{ resize: 'none' }}
          />
        </div>
      </Modal>

      <div className="sm:mx-10 mb-12 sm:mb-20">
        <p className="text-gray-400 text-xs">REPOSITORY</p>
        <a
          href={`https://github.com/${organization}/${repoName}`}
          target="_blank"
          className="text-white text-3xl mt-1 group flex items-center"
        >
          <h1>{repoName.toString()}</h1>
          <div className="transition ml-3 opacity-0 group-hover:opacity-100">
            <ExternalLink />
          </div>
        </a>
      </div>
      <StarHistory
        repoName={repoName}
        lastUpdated={lastUpdated}
        starHistory={starHistory}
        loadingStarHistory={loadingStarHistory}
        onOpenModal={(chartType) => toggleEmbedModal(chartType)}
      />
      <IssueTracker
        repoName={repoName}
        issueCounts={issueCounts}
        loadingIssueCounts={loadingIssueCounts}
        latestOpenIssueCount={retrieveLatestOpenIssueCount()}
        openIssueCountComparison={deriveOpenIssueCountComparison()}
        latestClosedIssueCount={retrieveLatestCloseIssueCount()}
        onOpenModal={(chartType) => toggleEmbedModal(chartType)}
      />
    </>
  )
}

export default RepositoryStatistics