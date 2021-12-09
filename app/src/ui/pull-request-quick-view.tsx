import * as React from 'react'
import { PullRequest } from '../models/pull-request'
import { PullRequestBadge } from './branches'
import { Dispatcher } from './dispatcher'
import { Button } from './lib/button'
import { SandboxedMarkdown } from './lib/sandboxed-markdown'
import { Octicon } from './octicons'
import * as OcticonSymbol from './octicons/octicons.generated'

interface IPullRequestQuickViewProps {
  readonly dispatcher: Dispatcher
  readonly pullRequest: PullRequest

  readonly pullRequestItemTop: number

  /** When mouse leaves the PR quick view */
  readonly onMouseLeave: () => void
}

export class PullRequestQuickView extends React.Component<
  IPullRequestQuickViewProps,
  {}
> {
  private baseHref = 'https://github.com/'

  private renderHeader = (): JSX.Element => {
    return (
      <header className="header">
        <Octicon symbol={OcticonSymbol.listUnordered} />
        <div className="action-needed">Review requested</div>
        <Button className="button-with-icon">
          View on GitHub
          <Octicon symbol={OcticonSymbol.linkExternal} />
        </Button>
      </header>
    )
  }

  private renderPR = (): JSX.Element => {
    const { title, pullRequestNumber, base, body } = this.props.pullRequest
    const displayBody =
      body !== undefined && body !== null && body.trim() !== ''
        ? body
        : '_No description provided._'
    return (
      <div className="pull-request">
        <div className="status">
          <Octicon className="icon" symbol={OcticonSymbol.gitPullRequest} />
          <span className="state">Open</span>
        </div>
        <div className="title">
          <h2>{title}</h2>
          <PullRequestBadge
            number={pullRequestNumber}
            dispatcher={this.props.dispatcher}
            repository={base.gitHubRepository}
          />
        </div>
        <SandboxedMarkdown markdown={displayBody} baseHref={this.baseHref} />
      </div>
    )
  }

  private onMouseLeave = () => {
    this.props.onMouseLeave()
  }

  private calculatePosition(
    prListItemTop: number
  ): React.CSSProperties | undefined {
    /** The max height of the visible quick view card is 556 (500 for scrollable
     * body and 56 for header)
     */
    const maxQuickViewHeight = 556

    // Important to retrieve as it changes for maximization on macOS and quick
    // view is relative to the top of branch container = foldout-container. But
    // if we can't find it (unlikely) we can atleast compensate for the toolbar
    // being 50px
    const topOfPRList =
      document.getElementById('foldout-container')?.getBoundingClientRect()
        .top ?? 50

    // This is currently staticly defined so not bothering to attain it from
    // dom searching.
    const heightPRListItem = 47

    // Top half of list with room to display aligned to top
    if (window.innerHeight - prListItemTop > maxQuickViewHeight) {
      return { top: prListItemTop - topOfPRList }
    }

    // Bottom half of list with room to display aligned to bottom.
    if (prListItemTop - maxQuickViewHeight > 0) {
      return { bottom: window.innerHeight - prListItemTop - heightPRListItem }
    }

    // If not enough room to display aligned top or bottom, attempt to center on
    // pr list item (won't be centered but close for prs with a body < max
    // height)
    const middlePrListItem = prListItemTop + heightPRListItem / 2
    const middleQuickView = maxQuickViewHeight / 2
    return { top: middlePrListItem - middleQuickView }
  }

  public render() {
    return (
      <div
        id="pull-request-quick-view"
        onMouseLeave={this.onMouseLeave}
        style={this.calculatePosition(this.props.pullRequestItemTop)}
      >
        <div className="pull-request-quick-view-contents">
          {this.renderHeader()}
          {this.renderPR()}
        </div>
      </div>
    )
  }
}