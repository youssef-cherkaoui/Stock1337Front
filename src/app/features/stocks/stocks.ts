import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StockService } from '../../services/stock';
import { Departement } from '../../shared/models/departement.model';
import { DepartementsService } from '../../services/departements';
import { AuthService } from '../../services/AuthService';
import { Stock, StockRequest } from '../../shared/models/stock.model';

@Component({
  selector: 'app-stocks',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './stocks.html',
  styleUrls: ['./stocks.css'],
})
export class StocksComponent implements OnInit {
  stocks: Stock[] = [];
  departements: Departement[] = [];
  isAdmin = false;
  showAddForm = false;
  editingStock: Stock | null = null;
  stockForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private stockService: StockService,
    private deptService: DepartementsService,
    private authService: AuthService
  ) {
    this.stockForm = this.fb.group({
      name: ['', Validators.required],
      localisation: ['', Validators.required],
      departementId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadStocks();
    this.deptService.getAllDepartements().subscribe(data => this.departements = data);
  }

  loadStocks(): void {
    this.stockService.getAllStocks().subscribe(data => {
      this.stocks = data;
    });
  }

  createStock(): void {
    if (this.stockForm.invalid) return;

    const request: StockRequest = this.stockForm.value;

    if (this.editingStock) {

      this.stockService.updateStock(this.editingStock.id, request).subscribe({
        next: () => {
          this.loadStocks();
          this.cancelEdit();
        },
        error: (err) => alert('Erreur update: ' + err.message)
      });
    } else {
      // Create new
      this.stockService.createStock(request).subscribe({
        next: () => {
          this.loadStocks();
          this.showAddForm = false;
          this.stockForm.reset();
        },
        error: (err) => alert('Erreur création: ' + err.message)
      });
    }
  }

  editStock(stock: Stock): void {
    this.editingStock = stock;
    this.showAddForm = true;
    this.stockForm.patchValue({
      name: stock.name,
      localisation: stock.localisation,
      departementId: stock.departement?.id || ''
    });
  }

  cancelEdit(): void {
    this.editingStock = null;
    this.showAddForm = false;
    this.stockForm.reset();
  }

  deleteStock(id: number): void {
    if (confirm('Supprimer ce stock?')) {
      this.stockService.deleteStock(id).subscribe({
        next: () => this.loadStocks(),
        error: (err) => alert('Erreur suppression: ' + err.message)
      });
    }
  }
}
