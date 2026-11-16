package com.ferragista.service;

import com.ferragista.dto.FornecedorDTO;
import com.ferragista.exception.BusinessException;
import com.ferragista.exception.ResourceNotFoundException;
import com.ferragista.model.Fornecedor;
import com.ferragista.repository.FornecedorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FornecedorService {

    private final FornecedorRepository fornecedorRepository;

    public FornecedorService(FornecedorRepository fornecedorRepository) {
        this.fornecedorRepository = fornecedorRepository;
    }

    public List<Fornecedor> listar(String busca) {
        if (busca != null && !busca.isBlank()) {
            return fornecedorRepository.findByRazaoSocialContainingIgnoreCaseOrNomeFantasiaContainingIgnoreCase(busca, busca);
        }
        return fornecedorRepository.findAll();
    }

    public Fornecedor buscarPorId(Long id) {
        return fornecedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fornecedor com ID " + id + " não encontrado"));
    }

    @Transactional
    public Fornecedor criar(FornecedorDTO dto) {
        if (fornecedorRepository.existsByCnpj(dto.getCnpj())) {
            throw new BusinessException("Já existe um fornecedor cadastrado com o CNPJ " + dto.getCnpj());
        }

        Fornecedor fornecedor = new Fornecedor();
        fornecedor.setRazaoSocial(dto.getRazaoSocial());
        fornecedor.setNomeFantasia(dto.getNomeFantasia());
        fornecedor.setCnpj(dto.getCnpj());
        fornecedor.setTelefone(dto.getTelefone());
        fornecedor.setEmail(dto.getEmail());
        fornecedor.setCidade(dto.getCidade());
        fornecedor.setEstado(dto.getEstado().toUpperCase());

        return fornecedorRepository.save(fornecedor);
    }

    @Transactional
    public Fornecedor atualizar(Long id, FornecedorDTO dto) {
        Fornecedor fornecedor = buscarPorId(id);

        if (!fornecedor.getCnpj().equals(dto.getCnpj()) && fornecedorRepository.existsByCnpj(dto.getCnpj())) {
            throw new BusinessException("Já existe outro fornecedor com o CNPJ " + dto.getCnpj());
        }

        fornecedor.setRazaoSocial(dto.getRazaoSocial());
        fornecedor.setNomeFantasia(dto.getNomeFantasia());
        fornecedor.setCnpj(dto.getCnpj());
        fornecedor.setTelefone(dto.getTelefone());
        fornecedor.setEmail(dto.getEmail());
        fornecedor.setCidade(dto.getCidade());
        fornecedor.setEstado(dto.getEstado().toUpperCase());

        return fornecedorRepository.save(fornecedor);
    }

    @Transactional
    public void deletar(Long id) {
        Fornecedor fornecedor = buscarPorId(id);
        fornecedorRepository.delete(fornecedor);
    }
}
