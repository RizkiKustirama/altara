import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 45,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1c1917", // stone-900
    backgroundColor: "#ffffff",
  },
  // Cover Page
  coverPage: {
    padding: 48,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
  },
  coverHeader: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#1c1917",
    paddingBottom: 16,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  brandSubtitle: {
    fontSize: 8,
    color: "#78716c", // stone-500
    letterSpacing: 1.5,
    marginTop: 3,
    textTransform: "uppercase",
  },
  docTypeBadge: {
    backgroundColor: "#f5f5f4", // stone-100
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: "#e7e5e4",
  },
  docTypeText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#44403c",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  coverBody: {
    marginVertical: "auto",
    paddingVertical: 40,
  },
  projectLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#78716c",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  projectName: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: "#0c0a09",
    marginBottom: 16,
    lineHeight: 1.2,
  },
  metaGrid: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e7e5e4",
    paddingTop: 16,
    display: "flex",
    flexDirection: "row",
    gap: 30,
  },
  metaItem: {
    display: "flex",
    flexDirection: "column",
  },
  metaLabel: {
    fontSize: 7.5,
    color: "#a8a29e",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#292524",
  },
  coverFooter: {
    borderTopWidth: 1,
    borderTopColor: "#e7e5e4",
    paddingTop: 12,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  confidentialNotice: {
    fontSize: 7.5,
    color: "#78716c",
    fontStyle: "italic",
  },

  // Content Pages
  sectionHeader: {
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1c1917",
    paddingBottom: 6,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: "#1c1917",
  },
  sectionSub: {
    fontSize: 7.5,
    color: "#78716c",
  },

  // Tables
  table: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    marginBottom: 18,
    borderWidth: 0.5,
    borderColor: "#e7e5e4",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeaderRow: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#f5f5f4",
    borderBottomWidth: 0.5,
    borderBottomColor: "#d6d3d1",
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#f5f5f4",
    paddingVertical: 5,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: "#fafaf9",
  },
  th: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#57534e",
    textTransform: "uppercase",
  },
  td: {
    fontSize: 8,
    color: "#292524",
  },
  tdBold: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#1c1917",
  },
  tdMuted: {
    fontSize: 7,
    color: "#78716c",
    marginTop: 1,
  },

  // Cue Badges
  cueBox: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  musicCue: {
    fontSize: 7,
    color: "#4338ca", // indigo-700
    backgroundColor: "#e0e7ff",
    paddingVertical: 1.5,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  lightingCue: {
    fontSize: 7,
    color: "#b45309", // amber-700
    backgroundColor: "#fef3c7",
    paddingVertical: 1.5,
    paddingHorizontal: 4,
    borderRadius: 2,
  },

  // Page Numbers
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#e7e5e4",
    paddingTop: 6,
    fontSize: 7,
    color: "#a8a29e",
  },
});
