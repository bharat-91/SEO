import { auditRepository } from '../repositories/auditRepository.js';
import { crawlSite } from '../crawler/index.js';
import { analyzePage } from '../analyzer/index.js';
import { checkHttpStatus } from '../analyzer/rules/httpStatus.js';
import { calculateSummary } from './summaryCalculator.js';
import { getLogger } from '../utils/logger.js';
import type { Audit, PageResult } from '../types/audit.js';

export class AuditService {
  private logger = getLogger();

  async startAudit(url: string): Promise<Audit> {
    this.logger.info('Starting audit', { url });
    const created = await auditRepository.createAudit(url);
    const audit = await auditRepository.updateAuditStatus(created._id!, 'RUNNING');

    // Fire-and-forget: the crawl/analyze pipeline runs without blocking the response
    void this.run(audit._id!, audit.url);

    return audit;
  }

  async getAudit(auditId: string): Promise<Audit> {
    return auditRepository.getAuditById(auditId);
  }

  async run(auditId: string, url: string): Promise<void> {
    try {
      this.logger.info('Running audit', { auditId });

      const crawlResult = await crawlSite(url);
      const homepage = crawlResult.pages[0];

      if (!homepage.html) {
        this.logger.warn('Homepage could not be fetched, failing audit', {
          auditId,
          error: homepage.fetchError,
        });
        await auditRepository.updateAuditStatus(
          auditId,
          'FAILED',
          homepage.fetchError || 'Failed to fetch homepage'
        );
        return;
      }

      const pageResults: PageResult[] = crawlResult.pages.map((page) => {
        if (!page.html) {
          const { issues } = checkHttpStatus(page.statusCode);
          return {
            url: page.url,
            statusCode: page.statusCode,
            fetchError: page.fetchError,
            issues,
            metrics: {
              titleLength: 0,
              metaDescriptionLength: 0,
              h1Count: 0,
              canonical: null,
              noindex: false,
              pageSizeKb: 0,
              internalLinkCount: 0,
            },
          };
        }

        const analysis = analyzePage({
          html: page.html,
          pageUrl: page.url,
          statusCode: page.statusCode,
          responseSizeBytes: page.responseSizeBytes,
          domainFilter: crawlResult.domainFilter,
        });

        return {
          url: page.url,
          statusCode: page.statusCode,
          issues: analysis.issues,
          metrics: analysis.metrics,
        };
      });

      const summary = calculateSummary(pageResults);

      await auditRepository.updateAuditResults(auditId, pageResults, summary);

      this.logger.info('Audit completed', {
        auditId,
        totalPages: pageResults.length,
        totalIssues: summary.totalIssues,
        navigationFound: crawlResult.navigationFound,
      });
    } catch (error) {
      this.logger.error('Audit execution failed', {
        auditId,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      await auditRepository.updateAuditStatus(
        auditId,
        'FAILED',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
}

export const auditService = new AuditService();
