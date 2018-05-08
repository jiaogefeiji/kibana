import expect from 'expect.js';

export function DashboardExpectProvider({ getService, getPageObjects }) {
  const log = getService('log');
  const retry = getService('retry');
  const testSubjects = getService('testSubjects');
  const find = getService('find');
  const filterBar = getService('filterBar');
  const PageObjects = getPageObjects(['dashboard', 'visualize']);

  return new class DashboardExpect {
    async pieSliceCount(expectedCount) {
      log.debug(`DashboardExpect.expectPieSliceCount(${expectedCount})`);
      await retry.try(async () => {
        const slicesCount = await PageObjects.dashboard.getPieSliceCount();
        expect(slicesCount).to.be(expectedCount);
      });
    }

    async panelCount(expectedCount) {
      log.debug(`DashboardExpect.panelCount(${expectedCount})`);
      await retry.try(async () => {
        const panelCount = await PageObjects.dashboard.getPanelCount();
        expect(panelCount).to.be(expectedCount);
      });
    }

    async selectedLegendColorCount(color, expectedCount) {
      log.debug(`DashboardExpect.selectedLegendColorCount(${color}, ${expectedCount})`);
      await retry.try(async () => {
        const selectedLegendColor = await testSubjects.findAll(`legendSelectedColor-${color}`);
        expect(selectedLegendColor.length).to.be(expectedCount);
      });
    }

    async docTableFieldCount(expectedCount) {
      log.debug(`DashboardExpect.docTableFieldCount(${expectedCount})`);
      await retry.try(async () => {
        const docTableCells = await testSubjects.findAll('docTableField');
        expect(docTableCells.length).to.be(expectedCount);
      });
    }

    async tsvbTimeSeriesLegendCount(expectedCount) {
      await retry.try(async () => {
        const tsvbLegendItems = await testSubjects.findAll('tsvbLegendItem');
        expect(tsvbLegendItems.length).to.be(expectedCount);
      });
    }

    async fieldSuggestionIndexPatterns(expectedIndexPatterns) {
      const indexPatterns = await filterBar.getFilterFieldIndexPatterns();
      expect(indexPatterns).to.eql(expectedIndexPatterns);
    }

    async legendValuesToExist(legendValues) {
      await Promise.all(legendValues.map(async legend => {
        await retry.try(async () => {
          const legendValueExists = await testSubjects.exists(`legend-${legend}`);
          expect(legendValueExists).to.be(true);
        });
      }));
    }

    async textWithinElementsExists(texts, getElementsFn) {
      await retry.try(async () => {
        const elements = await getElementsFn();
        const elementTexts = [];
        await Promise.all(elements.map(async element => {
          elementTexts.push(await element.getVisibleText());
        }));
        log.debug(`Found ${elements.length} elements with values: ${JSON.stringify(elementTexts)}`);
        texts.forEach(value => {
          const indexOfValue = elementTexts.indexOf(value);
          expect(indexOfValue).to.be.greaterThan(-1);
          elementTexts.splice(indexOfValue, 1);
        });
      });
    }

    async textWithinTestSubjectsExists(texts, selector) {
      log.debug(`textWithinTestSubjectsExists:(${JSON.stringify(texts)},${selector})`);
      await this.textWithinElementsExists(texts, async () => await testSubjects.findAll(selector));
    }

    async textWithinCssElementExists(texts, selector) {
      log.debug(`textWithinCssElementExists:(${JSON.stringify(texts)},${selector})`);
      await this.textWithinElementsExists(texts, async () => await find.allByCssSelector(selector));
    }

    async textWithinElementsDoNotExist(texts, getElementsFn) {
      await retry.try(async () => {
        const elements = await getElementsFn();
        const elementTexts = [];
        await Promise.all(elements.map(async element => {
          elementTexts.push(await element.getVisibleText());
        }));
        log.debug(`Found ${elements.length} elements with values: ${JSON.stringify(elementTexts)}`);
        texts.forEach(value => {
          const indexOfValue = elementTexts.indexOf(value);
          expect(indexOfValue).to.be(-1);
        });
      });
    }

    async textWithinCssElementDoNotExist(texts, selector) {
      log.debug(`textWithinCssElementExists:(${JSON.stringify(texts)},${selector})`);
      await this.textWithinElementsDoNotExist(texts, async () => await find.allByCssSelector(selector));
    }

    async timelionLegendCount(expectedCount) {
      await retry.try(async () => {
        const flotLegendLabels = await testSubjects.findAll('flotLegendLabel');
        expect(flotLegendLabels.length).to.be(expectedCount);
      });
    }

    async emptyTagCloudFound() {
      const tagCloudVisualizations = await testSubjects.findAll('tagCloudVisualization');
      const tagCloudsHaveContent = await Promise.all(tagCloudVisualizations.map(async tagCloud => {
        return await find.descendantExistsByCssSelector('text', tagCloud);
      }));
      expect(tagCloudsHaveContent.indexOf(false)).to.be.greaterThan(-1);
    }

    async tagCloudWithValuesFound(values) {
      const tagCloudVisualizations = await testSubjects.findAll('tagCloudVisualization');
      const matches = await Promise.all(tagCloudVisualizations.map(async tagCloud => {
        for (let i = 0; i < values.length; i++) {
          const valueExists = await testSubjects.descendantExists(values[i], tagCloud);
          if (!valueExists) {
            return false;
          }
        }
        return true;
      }));
      expect(matches.indexOf(true)).to.be.greaterThan(-1);
    }

    async goalAndGuageLabelsExist(labels) {
      await this.textWithinCssElementExists(labels, '.chart-label');
    }

    async metricValuesExist(values) {
      await this.textWithinCssElementExists(values, '.metric-value');
    }

    async tsvbMetricValuesExist(values) {
      await this.textWithinTestSubjectsExists(values, 'tsvbMetricValue');
    }

    async tsvbTopNValuesExist(values) {
      await this.textWithinTestSubjectsExists(values, 'tsvbTopNValue');
    }

    async vegaTextsExist(values) {
      await this.textWithinCssElementExists(values, '.vega-view-container text');
    }

    async vegaTextsDoNotExist(values) {
      await this.textWithinCssElementDoNotExist(values, '.vega-view-container text');
    }

    async tsvbMarkdownWithValuesExists(values) {
      await this.textWithinTestSubjectsExists(values, 'tsvbMarkdown');
    }

    async markdownWithValuesExists(values) {
      await this.textWithinTestSubjectsExists(values, 'markdownBody');
    }

    async savedSearchRowCount(expectedCount) {
      await retry.try(async () => {
        const savedSearchRows = await testSubjects.findAll('docTableExpandToggleColumn');
        expect(savedSearchRows.length).to.be(expectedCount);
      });
    }

    async dataTableRowCount(expectedCount) {
      await retry.try(async () => {
        const dataTableRows =
          await find.allByCssSelector('[data-test-subj="paginated-table-body"] [data-cell-content]');
        expect(dataTableRows.length).to.be(expectedCount);
      });
    }

    async seriesElementCount(expectedCount) {
      await retry.try(async () => {
        const seriesElements = await find.allByCssSelector('.series');
        expect(seriesElements.length).to.be(expectedCount);
      });
    }

    async inputControlItemCount(expectedCount) {
      await retry.try(async () => {
        const inputControlItems = await testSubjects.findAll('inputControlItem');
        expect(inputControlItems.length).to.be(expectedCount);
      });
    }

    async lineChartPointsCount(expectedCount) {
      await retry.try(async () => {
        const points = await find.allByCssSelector('.points');
        expect(points.length).to.be(expectedCount);
      });
    }

    async tsvbTableCellCount(expectedCount) {
      await retry.try(async () => {
        const tableCells = await find.allByCssSelector('.tsvb-table__value');
        expect(tableCells.length).to.be(expectedCount);
      });
    }
  };
}
