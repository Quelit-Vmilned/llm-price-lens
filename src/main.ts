import "./style.css";
import { calculateCost, DEFAULT_WORKLOAD, type Workload } from "./cost";
import { priceDataset, priceDatasetError } from "./data";
import { filterByProvider } from "./filter";
import {
  formatContext,
  formatDate,
  formatScore,
  formatStatus,
  formatUsd,
} from "./format";
import { searchModels } from "./search";
import { sortModels, type SortDirection, type SortKey, type SortSpec } from "./sort";
import { parseTokenCount } from "./token";
import type { ModelPrice, PriceDataset } from "./types";
import benchmarkSnapshot from "../data/benchmark-snapshot.json";
import qualityReport from "../data/quality-report.json";

interface AppState {
  query: string;
  provider: string;
  sortValue: string;
  workload: Workload;
  selectedModelId: string;
}

const state: AppState = {
  query: "",
  provider: "all",
  sortValue: "name-asc",
  workload: { ...DEFAULT_WORKLOAD },
  selectedModelId: "",
};

const elements = {
  datasetStatus: document.querySelector<HTMLParagraphElement>("#dataset-status")!,
  search: document.querySelector<HTMLInputElement>("#model-search")!,
  providerButtons: document.querySelectorAll<HTMLButtonElement>(".provider-button"),
  sort: document.querySelector<HTMLSelectElement>("#sort-select")!,
  resultCount: document.querySelector<HTMLParagraphElement>("#result-count")!,
  table: document.querySelector<HTMLTableElement>("#model-table")!,
  rows: document.querySelector<HTMLTableSectionElement>("#model-rows")!,
  emptyState: document.querySelector<HTMLParagraphElement>("#empty-state")!,
  inputTokens: document.querySelector<HTMLInputElement>("#input-tokens")!,
  outputTokens: document.querySelector<HTMLInputElement>("#output-tokens")!,
  calculatorModel: document.querySelector<HTMLSelectElement>("#calculator-model")!,
  costResult: document.querySelector<HTMLOutputElement>("#cost-result")!,
  costForm: document.querySelector<HTMLFormElement>("#cost-form")!,
  dataFooter: document.querySelector<HTMLParagraphElement>("#data-footer")!,
  releaseStatus: document.querySelector<HTMLParagraphElement>("#release-status")!,
  workloadError: document.querySelector<HTMLParagraphElement>("#workload-error")!,
  benchmarkStatus: document.querySelector<HTMLParagraphElement>("#benchmark-status")!,
  benchmarkRows: document.querySelector<HTMLTableSectionElement>("#benchmark-rows")!,
  benchmarkSource: document.querySelector<HTMLAnchorElement>("#benchmark-source")!,
  warnings: document.querySelector<HTMLUListElement>("#data-warnings")!,
};

let dataset!: PriceDataset;

function parseSortSpec(value: string): SortSpec {
  const [key, direction] = value.split("-");
  const keys: SortKey[] = ["name", "input", "output", "benchmark", "cost"];
  const directions: SortDirection[] = ["asc", "desc"];

  if (
    !keys.includes(key as SortKey) ||
    !directions.includes(direction as SortDirection)
  ) {
    return { key: "name", direction: "asc" };
  }

  return { key: key as SortKey, direction: direction as SortDirection };
}

function getVisibleModels(): ModelPrice[] {
  const searched = searchModels(dataset.models, state.query);
  const filtered = filterByProvider(searched, state.provider);
  return sortModels(filtered, parseSortSpec(state.sortValue), state.workload);
}

function appendCell(
  row: HTMLTableRowElement,
  label: string,
  ...children: Node[]
): HTMLTableCellElement {
  const cell = row.insertCell();
  cell.dataset.label = label;
  cell.append(...children);
  return cell;
}

function modelCell(model: ModelPrice): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = "model-cell";

  const name = document.createElement("strong");
  name.textContent = model.displayName;

  const id = document.createElement("span");
  id.className = "model-id";
  id.textContent = [...new Set([model.modelId, ...model.apiModelIds])].join(" / ");

  wrapper.append(name, id);
  return wrapper;
}

function benchmarkCell(model: ModelPrice): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = "benchmark-cell";

  const score = document.createElement("span");
  score.textContent = model.benchmarkScore === null && model.benchmarkRank !== null
    ? "Score Unknown"
    : formatScore(model.benchmarkScore);
  wrapper.append(score);

  if (model.benchmarkRank !== null) {
    const rank = document.createElement("span");
    rank.className = "cell-meta";
    rank.textContent = `Rank ${model.benchmarkRank}`;
    wrapper.append(rank);
  }

  if (model.benchmarkSource) {
    const source = document.createElement("span");
    source.className = "cell-meta";
    source.textContent = `${model.benchmarkSource} / ${formatDate(model.benchmarkCapturedAt)}`;
    wrapper.append(source);
  }

  return wrapper;
}

function sourceCell(model: ModelPrice): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = "source-cell";

  if (model.sourceUrl) {
    const link = document.createElement("a");
    link.href = model.sourceUrl;
    link.textContent = model.sourceName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    wrapper.append(link);
  } else {
    wrapper.textContent = model.sourceName;
  }

  const meta = document.createElement("span");
  meta.className = "cell-meta";
  meta.textContent = `Model updated ${formatDate(model.sourceUpdatedAt)}`;
  wrapper.append(meta);

  return wrapper;
}

function statusCell(model: ModelPrice): HTMLSpanElement {
  const badge = document.createElement("span");
  badge.className = `status-badge status-badge--${model.status}`;
  badge.textContent = formatStatus(model.status);
  badge.title = model.status === "imported"
    ? "Imported from the community-maintained source and schema-validated; not independently checked with the provider."
    : model.status === "verified"
      ? `Manually verified ${formatDate(model.verifiedAt)}`
      : "One or more fields need review; unknown prices stay Unknown.";
  return badge;
}

function renderRows(models: ModelPrice[]): void {
  elements.rows.replaceChildren();

  if (models.length === 0) {
    elements.table.hidden = true;
    elements.emptyState.hidden = false;
    elements.emptyState.textContent =
      dataset.models.length === 0 ? "No model data yet." : "No matches.";
    return;
  }

  elements.table.hidden = false;
  elements.emptyState.hidden = true;

  for (const model of models) {
    const row = elements.rows.insertRow();
    appendCell(row, "Model", modelCell(model));
    appendCell(row, "Provider", document.createTextNode(model.provider));
    appendCell(row, "Input $/1M", document.createTextNode(formatUsd(model.inputPerMillionUsd)));
    appendCell(row, "Output $/1M", document.createTextNode(formatUsd(model.outputPerMillionUsd)));
    appendCell(row, "Cached input", document.createTextNode(formatUsd(model.cachedInputPerMillionUsd)));
    appendCell(row, "Context", document.createTextNode(formatContext(model.contextWindow)));
    appendCell(row, "Benchmark", benchmarkCell(model));
    appendCell(
      row,
      "Example cost",
      document.createTextNode(formatUsd(calculateCost(model, state.workload))),
    );
    appendCell(row, "Source", sourceCell(model));
    appendCell(row, "Status", statusCell(model));
  }
}

function renderResultCount(models: ModelPrice[]): void {
  if (models.length === 0) {
    elements.resultCount.textContent = "No matches";
    return;
  }
  if (models.length === dataset.models.length) {
    elements.resultCount.textContent = `${models.length} models`;
    return;
  }
  elements.resultCount.textContent = `${models.length} of ${dataset.models.length} models`;
}

function renderDatasetStatus(): void {
  if (dataset.models.length === 0) {
    elements.datasetStatus.textContent =
      dataset.warnings[0] ?? "No model data yet.";
    return;
  }
  elements.datasetStatus.textContent = `${dataset.models.length} models · ${qualityReport.providerCount} providers · Last successful data sync ${new Date(dataset.generatedAt).toLocaleString()}`;
}

function renderFooter(): void {
  elements.dataFooter.textContent = `Last successful data sync ${new Date(dataset.generatedAt).toLocaleString()} · Upstream checks scheduled around every 30 minutes; GitHub may delay runs.`;
  elements.warnings.replaceChildren(...dataset.warnings.map((warning) => {
    const item = document.createElement("li");
    item.textContent = warning;
    return item;
  }));
  const ageHours = (Date.now() - Date.parse(dataset.generatedAt)) / 3_600_000;
  if (ageHours > 24) {
    const stale = document.createElement("li");
    stale.textContent = "This snapshot is over 24 hours old. The source may be unchanged or synchronization delayed; inspect the update runs before relying on it.";
    elements.warnings.prepend(stale);
  }
}

function renderBenchmarkSnapshot(): void {
  elements.benchmarkStatus.textContent = `${benchmarkSnapshot.metric} · Captured ${formatDate(benchmarkSnapshot.capturedAt)} · ${qualityReport.benchmark.matchedCount} current endpoints matched. Historical, self-reported results; ranks apply only within this six-model snapshot. Unmatched endpoints show No benchmark data.`;
  elements.benchmarkSource.href = benchmarkSnapshot.sourceUrl ?? "./data/benchmark-snapshot.json";
  elements.benchmarkSource.textContent = "DeepSeek-R1 report at the audited revision";
  for (const model of [...benchmarkSnapshot.models].sort((a, b) => (a.benchmarkRank ?? Infinity) - (b.benchmarkRank ?? Infinity))) {
    const row = elements.benchmarkRows.insertRow();
    for (const value of [model.modelId, formatScore(model.benchmarkScore), model.benchmarkRank === null ? "Unknown" : String(model.benchmarkRank)]) {
      row.insertCell().textContent = value;
    }
  }
}

function selectedModel(): ModelPrice | undefined {
  return dataset.models.find(
    (model) => model.modelId === state.selectedModelId,
  );
}

function updateCalculatorOutput(): void {
  const model = selectedModel();
  const cost = model ? calculateCost(model, state.workload) : null;
  elements.costResult.textContent =
    cost === null ? "Unknown" : formatUsd(cost);
}

function populateCalculatorModels(): void {
  elements.calculatorModel.replaceChildren();

  if (dataset.models.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No models";
    option.disabled = true;
    elements.calculatorModel.append(option);
    state.selectedModelId = "";
    return;
  }

  for (const model of dataset.models) {
    const option = document.createElement("option");
    option.value = model.modelId;
    option.textContent = `${model.displayName} (${model.provider})`;
    elements.calculatorModel.append(option);
  }

  if (!dataset.models.some((model) => model.modelId === state.selectedModelId)) {
    state.selectedModelId = dataset.models[0].modelId;
  }
  elements.calculatorModel.value = state.selectedModelId;
}

function readTokenCount(input: HTMLInputElement): number | null {
  return parseTokenCount(input.value);
}

function render(): void {
  elements.providerButtons.forEach((button) => {
    const isActive = button.dataset.provider === state.provider;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const models = getVisibleModels();
  renderRows(models);
  renderResultCount(models);
  updateCalculatorOutput();
}

function bindEvents(): void {
  elements.search.addEventListener("input", () => {
    state.query = elements.search.value;
    render();
  });

  elements.sort.addEventListener("change", () => {
    state.sortValue = elements.sort.value;
    render();
  });

  elements.providerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.provider = button.dataset.provider ?? "all";
      render();
    });
  });

  const handleWorkloadInput = () => {
    state.workload = {
      inputTokens: readTokenCount(elements.inputTokens),
      outputTokens: readTokenCount(elements.outputTokens),
    };
    const invalidInput = state.workload.inputTokens === null;
    const invalidOutput = state.workload.outputTokens === null;
    elements.inputTokens.setAttribute("aria-invalid", String(invalidInput));
    elements.outputTokens.setAttribute("aria-invalid", String(invalidOutput));
    elements.workloadError.hidden = !invalidInput && !invalidOutput;
    render();
  };

  elements.inputTokens.addEventListener("input", handleWorkloadInput);
  elements.outputTokens.addEventListener("input", handleWorkloadInput);
  elements.calculatorModel.addEventListener("change", () => {
    state.selectedModelId = elements.calculatorModel.value;
    render();
  });
  elements.costForm.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}

function renderDataError(message: string): void {
  elements.datasetStatus.textContent = "Data error";
  elements.resultCount.textContent = "Data error";
  elements.table.hidden = true;
  elements.emptyState.hidden = false;
  elements.emptyState.textContent = `Unable to load price data: ${message}`;
  elements.calculatorModel.replaceChildren();
  elements.costResult.textContent = "Unknown";
  elements.dataFooter.textContent = "Price data validation failed.";
  elements.costForm.querySelectorAll("input, select").forEach((control) => {
    (control as HTMLInputElement | HTMLSelectElement).disabled = true;
  });
}

elements.releaseStatus.textContent = `Phase 5 · v${__APP_VERSION__} · Build ${__BUILD_COMMIT__.slice(0, 7)}`;

if (priceDataset === null) {
  renderDataError(priceDatasetError ?? "Price data validation failed.");
} else {
  dataset = priceDataset;
  renderDatasetStatus();
  renderFooter();
  renderBenchmarkSnapshot();
  populateCalculatorModels();
  bindEvents();
  render();
}
