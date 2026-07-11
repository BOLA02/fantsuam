import { LoanRepository } from './loan.repository';
import { AppError } from '../../utils/AppError';
import { LoanListQuery } from './loan.types';

function toListDto(loan: any) {
  const nextSchedule = loan.schedules?.[0] ?? null;
  return {
    id: loan.id,
    loanNumber: loan.loanNumber,
    applicationId: loan.applicationId,
    customerId: loan.customerId,
    loanProductId: loan.loanProductId,
    principalAmount: loan.principalAmount,
    interestRate: loan.interestRate,
    processingFee: loan.processingFee,
    approvedAmount: loan.approvedAmount,
    disbursedAmount: loan.disbursedAmount,
    totalPayable: loan.totalPayable,
    outstandingBalance: loan.outstandingBalance,
    durationMonths: loan.durationMonths,
    repaymentFrequency: loan.repaymentFrequency,
    status: loan.status,
    approvalDate: loan.approvalDate,
    disbursementDate: loan.disbursementDate,
    maturityDate: loan.maturityDate,
    remarks: loan.remarks,
    createdAt: loan.createdAt,
    updatedAt: loan.updatedAt,
    customer: loan.customer,
    nextInstallment: nextSchedule
      ? {
          dueDate: nextSchedule.dueDate,
          totalAmount: nextSchedule.totalAmount,
          status: nextSchedule.status,
        }
      : null,
  };
}

export class LoanService {
  private repository = new LoanRepository();

  async getAllLoans(query: LoanListQuery) {
    const loans = await this.repository.findAll(query);
    return loans.map(toListDto);
  }

  async getLoanById(id: string) {
    const loan = await this.repository.findById(id);
    if (!loan) throw new AppError(404, 'Loan not found');
    return loan;
  }
}