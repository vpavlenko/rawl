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

    /*
    PROBLEM:

    When ?play=... is appended to URL, location.key becomes orphaned (undefined).
    The React Router history object might need to be shimmed to make this param
    completely transparent to browser navigation.
    See https://stackoverflow.com/a/56823112/264970.

    Consequences of trying to make ?play=... orthogonal to browse history:

    browse/b
      [click link]
    browse/b/c
      [play Song_X]
    browse/b/c?play=Song_X
      [scroll down]
      [back]
    browse/b
      [next song]
    browse/b?play=Song_Y (now location.key will be undefined)
      [forward]
    browse/b/c?play=Song_X (play param incorrectly reverts to Song_X)

    using back and forward has always been problematic with the play param,
    since it restores invalid URLs. Only now it breaks scroll restoration too.

    ...therefore, play param is now disabled.
     */
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
            height: searchParams.get("song") ? "1px" : "100%",
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
