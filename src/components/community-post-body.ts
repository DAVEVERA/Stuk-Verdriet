export function communityPostBodyOverflows(scrollHeight: number, clientHeight: number) {
  return scrollHeight > clientHeight;
}

export function getCommunityPostBodyViewState(canExpand: boolean, expanded: boolean) {
  return {
    bodyClassName: expanded
      ? "community-post-body is-expanded"
      : canExpand
        ? "community-post-body is-clipped"
        : "community-post-body",
    bodyExpandsOnClick: canExpand && !expanded,
    toggleLabel: expanded ? "Toon minder" : "Lees meer",
    toggleVisible: canExpand,
  };
}
