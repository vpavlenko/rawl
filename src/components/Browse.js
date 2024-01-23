import autoBindReact from "auto-bind/react";
import React from "react";
import BrowseList from "./BrowseList";

export default class Browse extends React.PureComponent {
  constructor(props) {
    super(props);
    autoBindReact(this);
  }

  componentDidMount() {
    this.navigate();
  }

  componentWillUnmount() {
    this.saveScrollPosition(this.props.locationKey);
  }

  saveScrollPosition(locationKey) {
    const scrollTop = Math.round(
      this.props.scrollContainerRef.current.scrollTop,
    );
    sessionStorage.setItem(locationKey, scrollTop.toString());
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    // Save the scroll position before the component updates
    if (prevProps.browsePath !== this.props.browsePath) {
      this.saveScrollPosition(prevProps.locationKey);
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    this.navigate();

    // (a long comment deleted, see mmontag/chip-player-js)
    if (this.props.historyAction === "POP") {
      // User has just navigated back or forward
      const { browsePath, locationKey } = this.props;
      if (sessionStorage.getItem(locationKey)) {
        const scrollToPosY = sessionStorage.getItem(locationKey);
        this.props.scrollContainerRef.current.scrollTo(0, scrollToPosY);
        sessionStorage.removeItem(locationKey); // Stop scroll restoration until next navigation
        console.debug(
          "%s (%s) scroll position restored to %s",
          browsePath,
          locationKey,
          scrollToPosY,
        );
      }
    } else if (prevProps.locationKey !== this.props.locationKey) {
      // Scroll to top when navigating to a new directory
      this.props.scrollContainerRef.current.scrollTo(0, 0);
    }
  }

  navigate() {
    const { browsePath, listing, fetchDirectory } = this.props;
    if (!listing) {
      fetchDirectory(browsePath);
    }
  }

  render() {
    const { listing, browsePath, playContext } = this.props;
    const listingWithParent = [
      {
        path: "..",
        type: "directory",
      },
      ...(listing || []),
    ];

    const searchParams = new URLSearchParams(window.location.search);

    return (
      <>
        <div
          style={{
            height: searchParams.get("song") ? "0px" : "100%",
            overflow: "scroll",
            margin: 0,
          }}
        >
          <BrowseList
            key={browsePath}
            {...this.props}
            playContext={playContext}
            items={listingWithParent}
          />
        </div>
      </>
    );
  }
}
