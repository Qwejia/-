const { getDataService } = require('./dataService');

const dataService = getDataService();

class FinanceService {
  monthEndCheckout(year, month) {
    const vouchers = dataService.getData('vouchers');
    const accounts = dataService.getData('accounts');
    const checkoutRecords = dataService.getData('checkoutRecords');
    
    this.checkIfAlreadyCheckedOut(checkoutRecords, year, month);
    this.checkUnpostedVouchers(vouchers, year, month);
    const accountBalances = this.calculateAccountBalances(year, month);
    const closingVoucher = this.generateClosingVoucher(year, month, accountBalances);
    const checkoutRecord = this.saveCheckoutRecord(year, month, closingVoucher._id);
    
    return { checkoutRecord, closingVoucher };
  }

  checkIfAlreadyCheckedOut(checkoutRecords, year, month) {
    const isCheckout = checkoutRecords.some(record => 
      record.year === year && record.month === month
    );
    
    if (isCheckout) {
      throw new Error(`该期间(${year}-${month})已结账`);
    }
  }

  checkUnpostedVouchers(vouchers, year, month) {
    const unpostedVouchers = vouchers.filter(voucher => {
      const voucherDate = new Date(voucher.date);
      const voucherYear = voucherDate.getFullYear();
      const voucherMonth = voucherDate.getMonth() + 1;
      
      return voucherYear === year && 
             voucherMonth === month &&
             voucher.status !== 'posted';
    });
    
    if (unpostedVouchers.length > 0) {
      throw new Error(`该期间(${year}-${month})有${unpostedVouchers.length}张未记账凭证，无法结账`);
    }
  }

  saveCheckoutRecord(year, month, voucherId) {
    const checkoutRecords = dataService.getData('checkoutRecords');
    
    const checkoutRecord = {
      _id: Date.now().toString(),
      year: year,
      month: month,
      checkoutDate: new Date().toISOString(),
      voucherId: voucherId
    };
    
    checkoutRecords.push(checkoutRecord);
    dataService.saveData('checkoutRecords', checkoutRecords);
    
    return checkoutRecord;
  }
  
  calculateAccountBalances(year, month) {
    const vouchers = dataService.getData('vouchers');
    const accounts = dataService.getData('accounts');
    const voucherEntries = dataService.getData('voucherEntries');
    
    const balances = {};
    accounts.forEach(account => {
      balances[account._id] = {
        accountId: account._id,
        accountName: account.name,
        accountCode: account.code,
        accountType: account.type,
        balance: 0
      };
    });
    
    const entriesByVoucherId = new Map();
    voucherEntries.forEach(entry => {
      const entries = entriesByVoucherId.get(entry.voucherId) || [];
      entries.push(entry);
      entriesByVoucherId.set(entry.voucherId, entries);
    });
    
    const allRelevantVouchers = vouchers.filter(voucher => {
      const voucherDate = new Date(voucher.date);
      const voucherYear = voucherDate.getFullYear();
      const voucherMonth = voucherDate.getMonth() + 1;
      
      return (voucherYear < year) || 
          (voucherYear === year && voucherMonth <= month);
    });
    
    allRelevantVouchers.forEach(voucher => {
      const entries = entriesByVoucherId.get(voucher._id) || [];
      
      entries.forEach(entry => {
        const balance = balances[entry.accountId];
        if (balance) {
          if (entry.debit) {
            balance.balance += entry.debit;
          }
          if (entry.credit) {
            balance.balance -= entry.credit;
          }
        }
      });
    });
    
    return Object.values(balances);
  }
  
  generateClosingVoucher(year, month, accountBalances) {
    const vouchers = dataService.getData('vouchers');
    const accounts = dataService.getData('accounts');
    const voucherEntries = dataService.getData('voucherEntries');
    
    const profitLossAccount = accounts.find(account => 
      account.code === '4103' || account.name === '本年利润'
    );
    
    if (!profitLossAccount) {
      throw new Error('未找到本年利润科目');
    }
    
    let totalIncome = 0;
    let totalExpense = 0;
    
    accountBalances.forEach(balance => {
      if (balance.accountType === 'income') {
        totalIncome += balance.balance;
      } else if (balance.accountType === 'expense') {
        totalExpense += balance.balance;
      }
    });
    
    const closingVoucher = {
      _id: Date.now().toString(),
      number: `JZ${year}${String(month).padStart(2, '0')}01`,
      date: `${year}-${String(month).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`,
      type: '4',
      title: `${year}年${month}月损益结转`,
      status: 'posted',
      totalDebit: 0,
      totalCredit: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const closingEntries = [];
    
    accountBalances.forEach(balance => {
      if (balance.accountType === 'income' && balance.balance > 0) {
        closingEntries.push({
          _id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          voucherId: closingVoucher._id,
          accountId: balance.accountId,
          accountName: balance.accountName,
          debit: balance.balance,
          credit: 0,
          description: `${year}年${month}月损益结转`
        });
        
        closingVoucher.totalDebit += balance.balance;
      }
    });
    
    accountBalances.forEach(balance => {
      if (balance.accountType === 'expense' && balance.balance > 0) {
        closingEntries.push({
          _id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          voucherId: closingVoucher._id,
          accountId: balance.accountId,
          accountName: balance.accountName,
          debit: 0,
          credit: balance.balance,
          description: `${year}年${month}月损益结转`
        });
        
        closingVoucher.totalCredit += balance.balance;
      }
    });
    
    const netProfit = totalIncome - totalExpense;
    if (netProfit > 0) {
      closingEntries.push({
        _id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        voucherId: closingVoucher._id,
        accountId: profitLossAccount._id,
        accountName: profitLossAccount.name,
        debit: 0,
        credit: netProfit,
        description: `${year}年${month}月损益结转`
      });
      closingVoucher.totalCredit += netProfit;
    } else if (netProfit < 0) {
      closingEntries.push({
        _id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        voucherId: closingVoucher._id,
        accountId: profitLossAccount._id,
        accountName: profitLossAccount.name,
        debit: Math.abs(netProfit),
        credit: 0,
        description: `${year}年${month}月损益结转`
      });
      closingVoucher.totalDebit += Math.abs(netProfit);
    }
    
    vouchers.push(closingVoucher);
    dataService.saveData('vouchers', vouchers);
    
    voucherEntries.push(...closingEntries);
    dataService.saveData('voucherEntries', voucherEntries);
    
    return closingVoucher;
  }

  getVoucherEntriesByVoucherId(voucherId) {
    const entries = dataService.getData('voucherEntries') || [];
    return entries.filter(entry => entry.voucherId === voucherId);
  }
  
  deleteVoucherEntriesByVoucherId(voucherId) {
    const entries = dataService.getData('voucherEntries') || [];
    const filteredEntries = entries.filter(entry => entry.voucherId !== voucherId);
    dataService.saveData('voucherEntries', filteredEntries);
  }
  
  updateArInvoiceBalance(invoiceId, amount) {
    const invoices = dataService.getData('arInvoices');
    const index = invoices.findIndex(i => i._id === invoiceId);
    if (index !== -1) {
      invoices[index].balance -= amount;
      invoices[index].updatedAt = new Date().toISOString();
      if (invoices[index].balance <= 0) {
        invoices[index].status = 'writtenoff';
        invoices[index].balance = 0;
      }
      dataService.saveData('arInvoices', invoices);
    }
  }
  
  updateApInvoiceBalance(invoiceId, amount) {
    const invoices = dataService.getData('apInvoices');
    const index = invoices.findIndex(i => i._id === invoiceId);
    if (index !== -1) {
      invoices[index].balance -= amount;
      invoices[index].updatedAt = new Date().toISOString();
      if (invoices[index].balance <= 0) {
        invoices[index].status = 'writtenoff';
        invoices[index].balance = 0;
      }
      dataService.saveData('apInvoices', invoices);
    }
  }
}

let financeServiceInstance = null;

const getFinanceService = () => {
  if (!financeServiceInstance) {
    financeServiceInstance = new FinanceService();
  }
  return financeServiceInstance;
};

module.exports = {
  FinanceService,
  getFinanceService
};