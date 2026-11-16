package com.ferragista.controller;

import com.ferragista.dto.VendaDTO;
import com.ferragista.model.Venda;
import com.ferragista.model.enums.StatusVenda;
import com.ferragista.service.VendaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendas")
@CrossOrigin(origins = "*")
public class VendaController {

    private final VendaService vendaService;

    public VendaController(VendaService vendaService) {
        this.vendaService = vendaService;
    }

    @GetMapping
    public ResponseEntity<List<Venda>> listar(@RequestParam(required = false) StatusVenda status) {
        return ResponseEntity.ok(vendaService.listar(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venda> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(vendaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Venda> realizarVenda(@Valid @RequestBody VendaDTO dto) {
        Venda venda = vendaService.realizarVenda(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(venda);
    }

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<Venda> cancelarVenda(@PathVariable Long id) {
        Venda venda = vendaService.cancelarVenda(id);
        return ResponseEntity.ok(venda);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        vendaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
